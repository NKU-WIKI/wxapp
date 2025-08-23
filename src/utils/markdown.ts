// 简单的同步markdown解析器，避免Taro模块加载问题
const parseMarkdown = (markdown: string): string => {
  // 简单的markdown转HTML实现
  let html = markdown
    .replace(/^### (.*$)/gim, '<h3 class="markdown-h3">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="markdown-h2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="markdown-h1">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="markdown-code">$1</code>')
    .replace(/```([\s\S]*?)```/g, '<pre class="code-block"><code>$1</code></pre>')
    .replace(/- (.*$)/gim, '<li class="markdown-li">$1</li>')
    .replace(/(\d+)\. (.*$)/gim, '<li class="markdown-li">$2</li>')
    .replace(/\n\n/g, '</p><p class="markdown-p">')
    .replace(/\n/g, '<br>');

  // 包装列表
  html = html
    .replace(/(<li class="markdown-li">.*<\/li>)+/g, '<ul class="markdown-ul">$&</ul>');

  return `<p class="markdown-p">${html}</p>`;
};

// 将markdown转换为小程序RichText支持的HTML格式
export function markdownToHtml(markdown: string): string {
  try {
    const html = parseMarkdown(markdown);

    // 对HTML进行一些清理，适配小程序RichText组件
    return html
      // 移除不必要的换行和空格
      .replace(/\n/g, '')
      .replace(/\s+/g, ' ')
      // 将代码块的样式适配小程序
      .replace(/<pre><code class="language-(\w+)">/g, '<pre class="code-block lang-$1"><code>')
      .replace(/<pre><code>/g, '<pre class="code-block"><code>')
      // 确保段落有合适的样式
      .replace(/<p>/g, '<p class="markdown-p">')
      // 确保标题有合适的样式
      .replace(/<h(\d)>/g, '<h$1 class="markdown-h$1">')
      // 确保列表有合适的样式
      .replace(/<ul>/g, '<ul class="markdown-ul">')
      .replace(/<ol>/g, '<ol class="markdown-ol">')
      .replace(/<li>/g, '<li class="markdown-li">')
      // 确保引用有合适的样式
      .replace(/<blockquote>/g, '<blockquote class="markdown-blockquote">')
      // 确保链接有合适的样式
      .replace(/<a href="([^"]+)">/g, '<a class="markdown-a" href="$1">')
      // 确保代码有合适的样式
      .replace(/<code>/g, '<code class="markdown-code">')
      // 确保表格有合适的样式
      .replace(/<table>/g, '<table class="markdown-table">')
      .replace(/<th>/g, '<th class="markdown-th">')
      .replace(/<td>/g, '<td class="markdown-td">');
  } catch (error) {
    console.error('Markdown parsing error:', error);
    return markdown; // 如果解析失败，返回原始文本
  }
}

// 获取markdown中的纯文本（用于预览或搜索）
export function markdownToText(markdown: string): string {
  try {
    // 移除markdown语法，保留纯文本
    return markdown
      .replace(/#{1,6}\s/g, '') // 移除标题标记
      .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体标记
      .replace(/\*(.*?)\*/g, '$1') // 移除斜体标记
      .replace(/`(.*?)`/g, '$1') // 移除代码标记
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 移除链接，保留文本
      .replace(/!\[.*?\]\(.*?\)/g, '') // 移除图片
      .replace(/>/g, '') // 移除引用标记
      .replace(/[-*_]{3,}/g, '') // 移除分割线
      .replace(/\n{2,}/g, '\n') // 合并多余的换行
      .trim();
  } catch (error) {
    console.error('Markdown to text error:', error);
    return markdown;
  }
}

// 测试markdown渲染功能
export function testMarkdown(): void {
  const testCases = [
    '# 这是一个标题\n\n这是一个**粗体**文本和*斜体*文本。',
    '```javascript\nconsole.log("Hello World");\n```',
    '> 这是一个引用块\n\n- 项目1\n- 项目2',
    '[链接文本](https://example.com)',
  ];

  console.log('Testing Markdown Rendering:');
  testCases.forEach((test, index) => {
    console.log(`Test ${index + 1}:`, test);
    console.log('Rendered:', markdownToHtml(test));
    console.log('---');
  });
}
