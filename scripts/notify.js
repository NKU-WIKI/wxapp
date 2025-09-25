const fs = require('fs');
const path = require('path');
const FormData = require('form-data'); // 需要安装 form-data
const axios = require('axios'); // 引入 axios

// --- Helper Functions ---

/**
 * 获取飞书 tenant_access_token
 * @param {string} appId - 飞书应用 ID
 * @param {string} appSecret - 飞书应用密钥
 * @returns {Promise<string|null>} access token 或 null
 */
async function getTenantAccessToken(appId, appSecret) {
  console.log('正在获取 Feishu tenant_access_token...');
  try {
    const response = await axios.post(
      'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
      {
        app_id: appId,
        app_secret: appSecret,
      },
      {
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      },
    );
    const data = response.data;
    if (data.code === 0) {
      console.log('成功获取 tenant_access_token。');
      return data.tenant_access_token;
    } else {
      console.error(`获取 tenant_access_token 失败: ${data.msg}`);
      return null;
    }
  } catch (error) {
    console.error(
      '请求 tenant_access_token 时发生网络错误:',
      error.response ? error.response.data : error.message,
    );
    return null;
  }
}

/**
 * 上传图片到飞书并获取 image_key
 * @param {string} accessToken
 * @param {string} imagePath
 * @returns {Promise<string|null>} image_key 或 null
 */
async function uploadImageToFeishu(accessToken, imagePath) {
  if (!fs.existsSync(imagePath)) {
    console.warn(`二维码图片文件不存在: ${imagePath}`);
    return null;
  }
  console.log(`正在上传二维码图片 ${imagePath} 到飞书...`);

  const form = new FormData();
  form.append('image_type', 'message');
  form.append('image', fs.createReadStream(imagePath));

  try {
    const response = await axios.post('https://open.feishu.cn/open-apis/im/v1/images', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = response.data;
    if (data.code === 0) {
      console.log('图片上传成功，获取 image_key:', data.data.image_key);
      return data.data.image_key;
    } else {
      console.error(`飞书图片上传失败: ${data.msg}`, data);
      return null;
    }
  } catch (error) {
    console.error(
      '请求飞书图片上传 API 时发生网络错误:',
      error.response ? error.response.data : error.message,
    );
    return null;
  }
}

/**
 * 格式化部署耗时
 * @param {number} startTime - Unix 时间戳 (秒)
 * @returns {string} 格式化后的时间字符串
 */
function formatDuration(startTime) {
  if (!startTime) return 'N/A';
  const durationInSeconds = Math.floor(Date.now() / 1000) - Number(startTime);
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = durationInSeconds % 60;
  return `${minutes} 分 ${seconds} 秒`;
}

/**
 * 构建飞书消息卡片
 * @param {object} params - 构建卡片所需的参数
 * @returns {object} 消息卡片 JSON 对象
 */
function buildMessageCard({
  status,
  repoName,
  branchName,
  version,
  commitAuthor,
  commitMessages,
  runUrl,
  commitUrl,
  duration,
  imageKey,
}) {
  const isSuccess = status === 'success';
  const headerTemplate = isSuccess ? 'green' : 'red';
  const statusIcon = isSuccess ? '✅' : '❌';
  const statusText = isSuccess ? '部署成功' : '部署失败';

  let commitContent = '';
  if (Array.isArray(commitMessages) && commitMessages.length > 0) {
    commitContent = commitMessages
      .map((c) => `• ${c.message.split('\\n')[0]} (by ${c.author.name})`)
      .join('\\n');
  } else {
    commitContent = '没有获取到具体的 commit 信息。';
  }

  const elements = [
    {
      tag: 'div',
      text: {
        tag: 'lark_md',
        content: `**${statusIcon} ${statusText}**`,
      },
    },
    {
      tag: 'div',
      fields: [
        { is_short: true, text: { tag: 'lark_md', content: `**📦 项目:**\n${repoName}` } },
        { is_short: true, text: { tag: 'lark_md', content: `**🌿 分支:**\n${branchName}` } },
      ],
    },
    {
      tag: 'div',
      fields: [
        { is_short: true, text: { tag: 'lark_md', content: `**🔖 版本号:**\n${version}` } },
        { is_short: true, text: { tag: 'lark_md', content: `**⏱️ 耗时:**\n${duration}` } },
      ],
    },
    {
      tag: 'div',
      text: { tag: 'lark_md', content: `**👤 最新提交者:**\n${commitAuthor}` },
    },
    { tag: 'hr' },
    {
      tag: 'div',
      text: { tag: 'lark_md', content: `**💬 提交信息:**\n${commitContent}` },
    },
  ];

  if (isSuccess) {
    if (imageKey) {
      elements.push({ tag: 'hr' });
      elements.push({
        tag: 'img',
        title: { tag: 'lark_md', content: '**📸 体验版二维码** (请使用微信扫描)' },
        image_key: imageKey,
        alt: { tag: 'plain_text', content: '小程序体验版二维码' },
      });
    } else {
      elements.push({
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: '**📸 体验版二维码**\n无法生成或上传二维码图片，请检查 Actions 日志。',
        },
      });
    }
  }

  elements.push({ tag: 'hr' });

  const actions = [
    {
      tag: 'button',
      text: { tag: 'plain_text', content: '🔗 查看工作流日志' },
      type: 'default',
      url: runUrl,
    },
  ];

  if (commitUrl) {
    actions.push({
      tag: 'button',
      text: { tag: 'plain_text', content: '🔍 查看提交详情' },
      type: 'default',
      url: commitUrl,
    });
  }

  elements.push({
    tag: 'action',
    actions,
  });

  return {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '小程序 CI/CD 通知' },
      template: headerTemplate,
    },
    elements,
  };
}

/**
 * 发送消息到飞书
 * @param {string} accessToken - access token
 * @param {string} chatId - 群聊 ID
 * @param {object} card - 消息卡片对象
 */
async function sendMessage(accessToken, chatId, card) {
  console.log(`正在发送消息到 Chat ID: ${chatId}...`);
  try {
    const response = await axios.post(
      `https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id`,
      {
        receive_id: chatId,
        msg_type: 'interactive',
        content: JSON.stringify(card),
      },
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    const data = response.data;
    if (data.code === 0) {
      console.log('飞书消息发送成功！');
    } else {
      console.error(`飞书消息发送失败: ${data.msg}`, data);
    }
  } catch (error) {
    console.error(
      '请求飞书 sendMessage API 时发生网络错误:',
      error.response ? error.response.data : error.message,
    );
  }
}

/**
 * 主函数
 */
async function main() {
  const {
    FEISHU_APP_ID,
    FEISHU_APP_SECRET,
    FEISHU_CHAT_ID,
    JOB_STATUS,
    REPO_NAME,
    BRANCH_NAME,
    VERSION,
    COMMIT_AUTHOR,
    COMMIT_MESSAGES_JSON,
    COMMIT_URL,
    RUN_URL,
    START_TIME,
    QR_CODE_PATH,
  } = process.env;

  if (!FEISHU_APP_ID || !FEISHU_APP_SECRET || !FEISHU_CHAT_ID) {
    console.warn(
      '缺少飞书相关的 Secrets (FEISHU_APP_ID, FEISHU_APP_SECRET, FEISHU_CHAT_ID)，已跳过发送通知。',
    );
    return;
  }

  const accessToken = await getTenantAccessToken(FEISHU_APP_ID, FEISHU_APP_SECRET);
  if (!accessToken) {
    console.error('无法获取 access token，通知发送中止。');
    process.exit(1);
  }

  // 上传图片（如果成功）
  const imageKey = QR_CODE_PATH ? await uploadImageToFeishu(accessToken, QR_CODE_PATH) : null;

  // 解析 commits
  let commitMessages = [];
  if (COMMIT_MESSAGES_JSON) {
    try {
      commitMessages = JSON.parse(COMMIT_MESSAGES_JSON);
    } catch (e) {
      console.error('解析 COMMIT_MESSAGES_JSON 失败:', e);
    }
  }

  const card = buildMessageCard({
    status: JOB_STATUS,
    repoName: REPO_NAME,
    branchName: BRANCH_NAME || 'N/A',
    version: VERSION || 'N/A',
    commitAuthor: COMMIT_AUTHOR || 'N/A',
    commitMessages,
    runUrl: RUN_URL,
    commitUrl: COMMIT_URL,
    duration: formatDuration(START_TIME),
    imageKey,
  });

  await sendMessage(accessToken, FEISHU_CHAT_ID, card);
}

main().catch((error) => {
  console.error('执行通知脚本时发生未知错误:', error);
  process.exit(1);
});
