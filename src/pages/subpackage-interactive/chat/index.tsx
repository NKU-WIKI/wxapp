import { View, ScrollView, Text, Input, Button } from '@tarojs/components'
import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Taro from '@tarojs/taro'
import CustomHeader from '@/components/custom-header'
import { ChatMessage } from '@/types/chat'
import { 
  addMessage, 
  streamMessageFromAI
} from '@/store/slices/chatSlice'
import { RootState, AppDispatch } from '@/store'
import styles from './index.module.scss'

const Chat = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { 
    currentSession, 
    isTyping, 
    error 
  } = useSelector((state: RootState) => state.chat)
  
  const [inputText, setInputText] = useState('')
  const [scrollTop, setScrollTop] = useState(0)

  // 滚动到底部
  const scrollToBottom = () => {
    const query = Taro.createSelectorQuery()
    query.select('.chat-content').scrollOffset()
    query.exec((res) => {
      if (res && res[0]) {
        setScrollTop(res[0].scrollHeight)
      }
    })
  }

  // 当消息更新时自动滚动到底部
  useEffect(() => {
    if (currentSession?.messages && currentSession.messages.length > 0) {
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    }
  }, [currentSession?.messages?.length])

  const handleSend = async () => {
    if (inputText.trim() && currentSession?.id) {
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        content: inputText.trim(),
        role: 'user',
        timestamp: Date.now()
      }
      
      // 添加用户消息到 Redux store
      dispatch(addMessage(userMessage))
      
      const messageContent = inputText.trim()
      setInputText('')
      
      // 发送消息到 AI (使用流式响应)
      dispatch(streamMessageFromAI({
        message: messageContent,
        sessionId: currentSession.id
      }))
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  const renderMessage = (message: ChatMessage) => {
    if (!message || !message.id) {
      return null
    }
    
    const isUser = message.role === 'user'
    
    return (
      <View key={message.id} className={`${styles.messageItem} ${isUser ? styles.userMessage : styles.assistantMessage}`}>
        {!isUser && (
          <View className={styles.avatarWrapper}>
            <View className={styles.avatar}>🤖</View>
          </View>
        )}
        
        <View className={styles.messageContent}>
          <View className={`${styles.messageBubble} ${isUser ? styles.userBubble : styles.assistantBubble}`}>
            <Text className={styles.messageText}>
              {message.content}
              {message.isStreaming && (
                <Text className={styles.streamingCursor}>|</Text>
              )}
            </Text>
          </View>
          <View className={`${styles.messageTime} ${isUser ? styles.userTime : styles.assistantTime}`}>
            {formatTime(message.timestamp)}
          </View>
        </View>

        {isUser && (
          <View className={styles.avatarWrapper}>
            <View className={styles.avatar}>👤</View>
          </View>
        )}
      </View>
    )
  }

  const renderWelcome = () => (
    <View className={styles.welcomeArea}>
      <View className={styles.welcomeIcon}>🤖</View>
      <View className={styles.welcomeTitle}>你好！我是 AI 助手</View>
      <View className={styles.welcomeDescription}>
        我可以帮你回答问题、解决问题，或者只是聊聊天。请告诉我你需要什么帮助？
      </View>
      <View className={styles.welcomeFeatures}>
        <View className={styles.featureItem}>💬 智能对话</View>
        <View className={styles.featureItem}>🔄 流式响应</View>
        <View className={styles.featureItem}>📝 代码生成</View>
        <View className={styles.featureItem}>🎯 问题解答</View>
      </View>
    </View>
  )

  const renderTypingIndicator = () => (
    <View className={styles.typingIndicator}>
      <View className={styles.avatarWrapper}>
        <View className={styles.avatar}>🤖</View>
      </View>
      <View className={styles.typingContent}>
        <Text>AI 正在思考</Text>
        <View className={styles.typingDots}>
          <View className={styles.dot}></View>
          <View className={styles.dot}></View>
          <View className={styles.dot}></View>
        </View>
      </View>
    </View>
  )

  const renderError = () => (
    error && (
      <View className={styles.errorMessage}>
        <Text>{error}</Text>
      </View>
    )
  )

  return (
    <View style={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
      {/* 1. 顶部必须是统一的自定义导航栏 */}
      <CustomHeader title="AI 助手" />
      
      {/* 2. 页面主体内容必须包裹在这个 View 和 ScrollView 中 */}
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <ScrollView 
          scrollY 
          style={{ height: '100%' }} 
          className={`${styles.chatContent} chat-content`}
          scrollTop={scrollTop}
          scrollWithAnimation
        >
          {!currentSession?.messages?.length ? renderWelcome() : (
            <View className={styles.messageList}>
              {currentSession.messages?.filter(msg => msg && msg.id).map(renderMessage)}
              {isTyping && renderTypingIndicator()}
              {renderError()}
            </View>
          )}
        </ScrollView>
      </View>

      {/* 3. 底部输入区域 */}
      <View className={styles.inputContainer}>
        <View className={styles.inputWrapper}>
          <Input
            type="text"
            placeholder="输入你的问题..."
            value={inputText}
            onInput={(e) => setInputText(e.detail.value)}
            confirmType="send"
            onConfirm={handleSend}
            className={styles.messageInput}
            disabled={isTyping}
          />
          <Button 
            type="primary"
            size="mini"
            onClick={handleSend}
            disabled={!inputText.trim() || isTyping}
            className={styles.sendButton}
          >
            {isTyping ? '发送中' : '发送'}
          </Button>
        </View>
      </View>
    </View>
  )
}

export default Chat 