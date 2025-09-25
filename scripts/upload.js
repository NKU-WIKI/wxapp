require('dotenv').config();
const ci = require('miniprogram-ci');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// 读取项目配置
const projectConfig = require('../project.config.json');
const packageJson = require('../package.json');

/**
 * 格式化 Git 提交日期为指定的中文格式
 * @param {string} dateString - ISO 格式的日期字符串
 * @returns {string} 格式化后的日期字符串
 */
function formatCommitDate(dateString) {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  let period = '';
  // 根据用户示例 "中午11点58分" 调整时间段
  if (hours >= 0 && hours <= 4) period = '凌晨';
  else if (hours >= 5 && hours <= 8) period = '早上';
  else if (hours >= 9 && hours <= 10) period = '上午';
  else if (hours >= 11 && hours <= 12) period = '中午';
  else if (hours >= 13 && hours <= 17) period = '下午';
  else period = '晚上';

  let displayHours = hours;
  if (period === '下午' || period === '晚上') {
    if (hours > 12) {
      displayHours = hours - 12;
    }
  }
  if (displayHours === 0) {
    displayHours = 12; // 凌晨 0 点显示为 12 点
  }

  const pad = (num) => num.toString().padStart(2, '0');
  return `${year}年${month}月${day}日${period}${displayHours}点${pad(minutes)}分`;
}

/**
 * 从 Git 获取最新提交信息并生成描述
 * @returns {string}
 */
function getCommitDesc() {
  try {
    const [author, dateString] = execSync('git log -1 --pretty=format:"%an|%ai"')
      .toString()
      .trim()
      .split('|');
    const formattedDate = formatCommitDate(dateString);
    return `${author} 在 ${formattedDate} 提交上传`;
  } catch (error) {
    console.warn('获取 Git 提交信息失败，将使用默认备注。', error);
    return '自动构建上传';
  }
}

async function upload() {
  try {
    // 验证必要的环境变量
    const requiredEnvVars = ['PRIVATE_KEY_PATH', 'APP_ID'];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`缺少必要的环境变量: ${envVar}`);
      }
    }

    // 检查私钥文件是否存在
    const privateKeyPath = process.env.PRIVATE_KEY_PATH;
    if (!fs.existsSync(privateKeyPath)) {
      throw new Error(`私钥文件不存在: ${privateKeyPath}`);
    }

    // 创建项目实例
    const project = new ci.Project({
      appid: process.env.APP_ID,
      type: 'miniProgram',
      projectPath: path.resolve(__dirname, '../dist'),
      privateKeyPath: privateKeyPath,
      ignores: ['node_modules/**/*'],
    });

    // 获取版本号和描述
    const version = process.env.VERSION || packageJson.version;
    const desc = process.env.DESC || getCommitDesc();
    const robot = process.env.ROBOT || 1; // 机器人编号，1-30

    // 上传代码
    const uploadResult = await ci.upload({
      project,
      version,
      desc,
      robot,
      setting: {
        es6: true,
        es7: true,
        minifyJS: true,
        minifyWXML: true,
        minifyWXSS: true,
        minify: true,
        codeProtect: false,
        autoPrefixWXSS: true,
      },
    });

    // 默认生成体验版预览二维码
    const previewResult = await ci.preview({
      project,
      desc: `预览版本 ${version}`,
      setting: {
        es6: true,
        es7: true,
        minifyJS: true,
        minifyWXML: true,
        minifyWXSS: true,
        minify: true,
        codeProtect: false,
        autoPrefixWXSS: true,
      },
      qrcodeFormat: 'image',
      qrcodeOutputDest: path.resolve(__dirname, '../preview.jpg'),
      pagePath: 'pages/home/index', // 设置正确的默认预览页面
      // 标记为体验版
      experience: true,
    });
    console.log('体验版二维码已生成: preview.jpg', previewResult);
  } catch (error) {
    console.error('上传失败:', error);
    process.exit(1);
  }
}

upload();
