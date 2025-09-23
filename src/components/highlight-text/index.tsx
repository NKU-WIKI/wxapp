import { Text } from '@tarojs/components'

interface HighlightTextProps {
  text: string
  keywords: string[]
  highlightStyle?: React.CSSProperties
  highlightClassName?: string
}

const HighlightText = ({
  text,
  keywords,
  highlightStyle = { color: '#ff4d4f', fontWeight: 'bold' },
  highlightClassName = 'highlight-text'
}: HighlightTextProps) => {
  if (!keywords.length || !text) {
    return <Text>{text}</Text>
  }

  // 创建正则表达式来匹配所有关键词（忽略大小写）
  const keywordRegex = new RegExp(`(${keywords.join('|')})`, 'gi')
  const parts = text.split(keywordRegex)

  return (
    <Text>
      {parts.map((part, index) => {
        const isKeyword = keywords.some(keyword =>
          keyword.toLowerCase() === part.toLowerCase()
        )
        return isKeyword ? (
          <Text
            key={index}
            className={highlightClassName}
            style={highlightStyle}
          >
            {part}
          </Text>
        ) : (
          <Text key={index}>{part}</Text>
        )
      })}
    </Text>
  )
}

export default HighlightText
