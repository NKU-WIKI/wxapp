const ci = require('miniprogram-ci');
const path = require('path');
const fs = require('fs');

// 读取项目配置
const projectConfig = require('../project.config.json');

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
      ignores: ['node_modules/**/*']
    });

    // 获取版本号和描述
    const version = process.env.VERSION || '1.0.0';
    const desc = process.env.DESC || '自动构建上传';
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
        autoPrefixWXSS: true
      }
    });


    // 预览二维码（可选）
    if (process.env.GENERATE_PREVIEW === 'true') {
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
          autoPrefixWXSS: true
        },
        qrcodeFormat: 'image',
        qrcodeOutputDest: path.resolve(__dirname, '../preview.jpg'),
        pagePath: 'pages/index/index'
      });
    }

  } catch (error) {
    process.exit(1);
  }
}

upload();