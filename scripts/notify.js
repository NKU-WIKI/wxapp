const fs = require('fs');
const path = require('path');

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
    const response = await fetch(
      'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          app_id: appId,
          app_secret: appSecret,
        }),
      },
    );
    const data = await response.json();
    if (data.code === 0) {
      console.log('成功获取 tenant_access_token。');
      return data.tenant_access_token;
    } else {
      console.error(`获取 tenant_access_token 失败: ${data.msg}`);
      return null;
    }
  } catch (error) {
    console.error('请求 tenant_access_token 时发生网络错误:', error);
    return null;
  }
}

/**
 * 构建飞书消息卡片
 * @param {object} params - 构建卡片所需的参数
 * @returns {object} 消息卡片 JSON 对象
 */
function buildMessageCard({
  status,
  repoName,
  version,
  commitAuthor,
  commitMessage,
  runUrl,
  logContent,
}) {
  const isSuccess = status === 'success';
  const headerTemplate = isSuccess ? 'green' : 'red';
  const statusIcon = isSuccess ? '✅' : '❌';
  const statusText = isSuccess ? '部署成功' : '部署失败';

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
        {
          is_short: true,
          text: {
            tag: 'lark_md',
            content: `**📦 项目:**\n${repoName}`,
          },
        },
        {
          is_short: true,
          text: {
            tag: 'lark_md',
            content: `**🔖 版本号:**\n${version}`,
          },
        },
      ],
    },
    {
      tag: 'div',
      fields: [
        {
          is_short: true,
          text: {
            tag: 'lark_md',
            content: `**👤 提交者:**\n${commitAuthor}`,
          },
        },
        {
          is_short: true,
          text: {
            tag: 'lark_md',
            content: `**💬 提交信息:**\n${commitMessage.split('\\n')[0]}`,
          },
        },
      ],
    },
    {
      tag: 'hr',
    },
  ];

  if (isSuccess && logContent) {
    // 尝试从日志中提取二维码
    const qrCodeRegex = /(-{10,}[\s\S]*-{10,})/;
    const match = logContent.match(qrCodeRegex);
    if (match && match[0]) {
      elements.push({
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: `**📸 体验版二维码** (请使用微信扫描):\n\`\`\`\n${match[0]}\n\`\`\``,
        },
      });
    } else {
      elements.push({
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: '**📸 体验版二维码**\n无法从日志中提取二维码，请检查 Actions 日志。',
        },
      });
    }
  }

  elements.push({
    tag: 'action',
    actions: [
      {
        tag: 'button',
        text: {
          tag: 'plain_text',
          content: '🔗 查看工作流日志',
        },
        type: 'default',
        url: runUrl,
      },
    ],
  });

  return {
    config: { wide_screen_mode: true },
    header: {
      title: {
        tag: 'plain_text',
        content: '小程序 CI/CD 通知',
      },
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
    const response = await fetch(
      `https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          receive_id: chatId,
          msg_type: 'interactive',
          content: JSON.stringify(card),
        }),
      },
    );
    const data = await response.json();
    if (data.code === 0) {
      console.log('飞书消息发送成功！');
    } else {
      console.error(`飞书消息发送失败: ${data.msg}`, data);
    }
  } catch (error) {
    console.error('请求飞书 sendMessage API 时发生网络错误:', error);
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
    VERSION,
    COMMIT_AUTHOR,
    COMMIT_MESSAGE,
    RUN_URL,
    LOG_FILE_PATH,
  } = process.env;

  if (!FEISHU_APP_ID || !FEISHU_APP_SECRET || !FEISHU_CHAT_ID) {
    console.warn(
      '缺少飞书相关的 Secrets (FEISHU_APP_ID, FEISHU_APP_SECRET, FEISHU_CHAT_ID)，已跳过发送通知。',
    );
    return;
  }

  let logContent = '';
  if (LOG_FILE_PATH && fs.existsSync(LOG_FILE_PATH)) {
    logContent = fs.readFileSync(LOG_FILE_PATH, 'utf-8');
  } else {
    console.warn(`日志文件路径未提供或文件不存在: ${LOG_FILE_PATH}`);
  }

  const accessToken = await getTenantAccessToken(FEISHU_APP_ID, FEISHU_APP_SECRET);
  if (!accessToken) {
    console.error('无法获取 access token，通知发送中止。');
    process.exit(1);
  }

  const card = buildMessageCard({
    status: JOB_STATUS,
    repoName: REPO_NAME,
    version: VERSION || 'N/A',
    commitAuthor: COMMIT_AUTHOR || 'N/A',
    commitMessage: COMMIT_MESSAGE || 'N/A',
    runUrl: RUN_URL,
    logContent,
  });

  await sendMessage(accessToken, FEISHU_CHAT_ID, card);
}

main().catch((error) => {
  console.error('执行通知脚本时发生未知错误:', error);
  process.exit(1);
});

