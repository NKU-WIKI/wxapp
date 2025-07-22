import { View, ScrollView, Text, Textarea, Image } from '@tarojs/components'
import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Taro from '@tarojs/taro'
import CustomHeader from '@/components/custom-header'
import { ChatMessage } from '@/types/chat'
import { 
  addMessage, 
  streamMessageFromAI,
  createSession
} from '@/store/slices/chatSlice'
import { RootState, AppDispatch } from '@/store'
import styles from './index.module.scss'

// 导入本地资源
import RobotAvatar from '@/assets/robot.svg';
import UserAvatar from '@/assets/profile.svg'; // 假设有一个用户头像
import SendIcon from '@/assets/send.svg';
import MenuIcon from '@/assets/more-horizontal.svg'; // 假设有一个菜单图标
import ChatSidebar from './components/chat-sidebar';

const Chat = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { 
    currentSession, 
    isTyping, 
    isLoading,
    error,
    sessions
  } = useSelector((state: RootState) => state.chat)
  
  const [inputText, setInputText] = useState('')
  const [scrollTop, setScrollTop] = useState(9999) // 初始化一个较大的值以滚动到底部
  const scrollViewRef = useRef(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  // 确保有一个当前会话
  useEffect(() => {
    // 如果没有会话，创建一个新会话
    if (sessions.length === 0 || !currentSession) {
      dispatch(createSession({ title: '新对话' }))
    }
  }, [dispatch, sessions.length, currentSession])

  // 当消息更新时自动滚动到底部
  useEffect(() => {
    if (currentSession?.messages && currentSession.messages.length > 0) {
      Taro.nextTick(() => {
        setScrollTop(prev => prev + 10000) // 增加 scrollTop 以确保滚动到底部
      })
    }
  }, [currentSession?.messages?.length, isTyping])

  const handleSend = async () => {
    if (inputText.trim() && currentSession?.id) {
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        content: inputText.trim(),
        role: 'user',
        timestamp: Date.now()
      }
      
      dispatch(addMessage(userMessage))
      
      const messageContent = inputText.trim()
      setInputText('')
      
      dispatch(streamMessageFromAI({
        message: messageContent,
        sessionId: currentSession.id
      }))
    }
  }

  const renderMessage = (message: ChatMessage) => {
    if (!message || !message.id) {
      return null
    }
    
    const isUser = message.role === 'user'
    
    return (
      <View key={message.id} className={`${styles.messageItem} ${isUser ? styles.userMessage : styles.assistantMessage}`}>
        <Image src={isUser ? UserAvatar : RobotAvatar} className={styles.avatar} />
        <View className={styles.messageContent}>
          <View className={`${styles.messageBubble} ${isUser ? styles.userBubble : styles.assistantBubble}`}>
            <Text selectable>{message.content}</Text>
            {message.isStreaming && <View className={styles.streamingCursor} />}
          </View>
        </View>
      </View>
    )
  }

  const renderWelcome = () => (
    <View className={styles.welcomeContainer}>
      <Image src={RobotAvatar} className={styles.welcomeLogo} />
      <Text className={styles.welcomeTitle}>NKU-AI 助手</Text>
      <Text className={styles.welcomeTip}>今天有什么可以帮到你？</Text>
    </View>
  )

  const renderTypingIndicator = () => (
    <View className={`${styles.messageItem} ${styles.assistantMessage}`}>
      <Image src={RobotAvatar} className={styles.avatar} />
      <View className={styles.messageContent}>
        <View className={`${styles.messageBubble} ${styles.assistantBubble}`}>
          <View className={styles.typingIndicator}>
            <View className={`${styles.dot} ${styles.dot1}`}></View>
            <View className={`${styles.dot} ${styles.dot2}`}></View>
            <View className={`${styles.dot} ${styles.dot3}`}></View>
          </View>
        </View>
      </View>
    </View>
  )

  return (
    <View className={styles.chatPage}>
      <CustomHeader 
        title="AI 助手" 
        leftIcon={MenuIcon}
        onLeftClick={() => setIsSidebarOpen(true)}
      />
      
      {isLoading ? (
        <View className={styles.loadingContainer}>
          <View className={styles.loadingSpinner}></View>
          <Text className={styles.loadingText}>加载会话中...</Text>
        </View>
      ) : (
        <ScrollView 
          ref={scrollViewRef}
          scrollY 
          className={styles.chatContainer}
          scrollTop={scrollTop}
          scrollWithAnimation
        >
          {(!currentSession?.messages || currentSession.messages.length === 0) 
            ? renderWelcome() 
            : currentSession.messages.map(renderMessage)}
          {isTyping && renderTypingIndicator()}
          {error && <View className={styles.errorText}>{error}</View>}
        </ScrollView>
      )}

      {/* 侧边栏不需要额外的容器，直接渲染组件 */}
      {isSidebarOpen && <ChatSidebar onClose={() => setIsSidebarOpen(false)} />}

      <View className={styles.inputArea}>
        <Textarea
          className={styles.inputField}
          placeholder='问我任何问题...'
          value={inputText}
          onInput={(e) => setInputText(e.detail.value)}
          autoHeight
          maxlength={-1}
          showConfirmBar={false}
          confirmType="send"
          disabled={isTyping}
          onConfirm={handleSend}
        />
        <View className={`${styles.sendButton} ${(!inputText.trim() || isTyping) ? styles.sendButtonDisabled : ''}`} onClick={handleSend}>
          <Image src={SendIcon} className={styles.sendIcon} />
        </View>
      </View>
    </View>
  )
}

export default Chat