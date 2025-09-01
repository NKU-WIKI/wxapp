// 简单的同步markdown解析器，避免Taro模块加载问题
const parseMarkdown = (markdown: string): string => {
  // 预处理：清理多余的空行，但保留段落分隔
  let processedMarkdown = markdown
    // 将多个连续空行压缩为两个（保留段落分隔）
    .replace(/\n{3,}/g, '\n\n')
    // 移除行首和行尾的空白字符
    .split('\n')
    .map(line => line.trim())
    .join('\n');

  // 解析各种markdown元素
  let html = processedMarkdown
    // 标题（一级和二级标题转换为三级标题，其他保持不变）
    .replace(/^### (.*$)/gim, '<h3 class="markdown-h3">$1</h3>')
    .replace(/^## (.*$)/gim, '<h3 class="markdown-h3">$1</h3>')
    .replace(/^# (.*$)/gim, '<h3 class="markdown-h3">$1</h3>')
    // 四级及更小标题保持原样
    .replace(/^#### (.*$)/gim, '<h4 class="markdown-h4">$1</h4>')
    .replace(/^##### (.*$)/gim, '<h5 class="markdown-h5">$1</h5>')
    .replace(/^###### (.*$)/gim, '<h6 class="markdown-h6">$1</h6>')
    // 分隔线（---、***、___ 三种形式）
    .replace(/^[-*_]{3,}$/gm, '<hr class="markdown-hr">')
    // 代码块（必须在其他代码处理之前）
    .replace(/```([\s\S]*?)```/g, (_, code) => {
      // 清理代码内容，移除首尾空白行
      const cleanCode = code.replace(/^\n+|\n+$/g, '');
      return `<pre class="code-block"><code>${cleanCode}</code></pre>`;
    })
    // 粗体和斜体
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // 行内代码
    .replace(/`(.*?)`/g, '<code class="markdown-code">$1</code>')
    // 无序列表 - 改为带点的加粗格式
    .replace(/- (.*$)/gim, '<span class="markdown-list-item">• <strong>$1</strong></span>')
    // 有序列表 - 改为带点的加粗格式
    .replace(/(\d+)\. (.*$)/gim, '<span class="markdown-list-item">• <strong>$2</strong></span>')
    // 段落分隔（双换行转为段落分隔）
    .replace(/\n\n/g, '</p><p class="markdown-p">')
    // 单换行在列表中保持，段落中转为换行符
    .replace(/\n/g, (match, offset, string) => {
      // 如果在列表内部，保留换行；否则转为<br>
      const beforeChar = offset > 0 ? string[offset - 1] : '';
      const afterChar = offset < string.length - 1 ? string[offset + 1] : '';
      if (beforeChar === '-' || afterChar === '-') {
        return '\n';
      }
      return '<br>';
    });

  // 不再需要包装列表，列表项直接作为span元素

  // 清理HTML结构
  html = html
    // 移除空的段落
    .replace(/<p class="markdown-p"><\/p>/g, '')
    // 移除开头和结尾的段落包装，以减少与周围元素的间距
    .replace(/^<p class="markdown-p">/, '')
    .replace(/<\/p>$/, '');

  // 重新包装内容，但使用更紧凑的结构
  if (html.trim()) {
    // 如果内容以块级元素开头，不需要额外包装
    if (!html.startsWith('<h1 class="markdown-h1">') &&
        !html.startsWith('<h2 class="markdown-h2">') &&
        !html.startsWith('<h3 class="markdown-h3">') &&
        !html.startsWith('<h4 class="markdown-h4">') &&
        !html.startsWith('<h5 class="markdown-h5">') &&
        !html.startsWith('<h6 class="markdown-h6">') &&
        !html.startsWith('<span class="markdown-list-item">') &&
        !html.startsWith('<pre class="code-block">') &&
        !html.startsWith('<hr class="markdown-hr">')) {
      // 使用div包装而不是p，以减少默认间距
      html = `<div class="markdown-content">${html}</div>`;
    } else {
      // 如果以块级元素开头，直接返回
      html = `<div class="markdown-content">${html}</div>`;
    }
  }

  return html;
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
      // 列表项使用span标签，已在前面处理
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
    
    return markdown;
  }
}

// 测试markdown渲染功能
export function testMarkdown(): void {
  const testCases = [
    '# 这是一个标题\n\n这是一个**粗体**文本和*斜体*文本。',
    '```javascript\n\n```',
    '> 这是一个引用块\n\n- 项目1\n- 项目2',
    '[链接文本](https://example.com)',
    '---\n\n分隔线测试\n\n***\n\n另一个分隔线\n\n___\n\n多余的\n\n\n\n换行测试',
  ];

  
  testCases.forEach((_test, _index) => {
    
    
    
  });
}
