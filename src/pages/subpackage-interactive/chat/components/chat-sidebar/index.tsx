import { View, Text, ScrollView, Image, Input } from '@tarojs/components'
import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { ChatSession } from '@/types/chat'
import { RootState, AppDispatch } from '@/store'
import {
  createSession,
  switchSession,
  deleteSession,
  renameSession
} from '@/store/slices/chatSlice'
import styles from './index.module.scss'

// 导入本地资源
import PlusIcon from '@/assets/plus.png';
import DeleteIcon from '@/assets/x.png';
import CheckIcon from '@/assets/check-square.svg';
import AboutIcon from '@/components/about-icons';

interface ChatSidebarProps {
  onClose: () => void;
}

const ChatSidebar = ({ onClose }: ChatSidebarProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const { sessions, currentSession, isLoading } = useSelector((state: RootState) => state.chat)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameText, setRenameText] = useState('')
  const [safeAreaInsetTop, setSafeAreaInsetTop] = useState(44) // 默认状态栏高度

  // 获取设备信息并设置安全区域高度
  useEffect(() => {
    try {
      const systemInfo = Taro.getSystemInfoSync()
      if (systemInfo && systemInfo.statusBarHeight) {
        setSafeAreaInsetTop(systemInfo.statusBarHeight)
      }
    } catch (e) {
      console.error('获取系统信息失败', e)
    }
  }, [])

  const handleCreateSession = () => {
    dispatch(createSession({ title: '新对话' }))
    onClose()
  }

  const handleSwitchSession = (sessionId: string) => {
    dispatch(switchSession(sessionId))
    onClose()
  }

  const handleDeleteSession = (e, sessionId: string) => {
    e.stopPropagation() // 防止触发切换会话
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个会话吗？此操作不可撤销。',
      success: (res) => {
        if (res.confirm) {
          dispatch(deleteSession(sessionId))
        }
      }
    })
  }

  const handleStartRename = (e, session: ChatSession) => {
    e.stopPropagation()
    setRenamingId(session.id)
    setRenameText(session.title)
  }

  const handleConfirmRename = (e, sessionId: string) => {
    e.stopPropagation()
    if (renameText.trim()) {
      dispatch(renameSession({ id: sessionId, title: renameText.trim() }))
      setRenamingId(null)
    }
  }

  return (
    <>
      <View className={styles.sidebarOverlay} onClick={onClose} />
      <View className={styles.sidebar} style={{ paddingTop: `${safeAreaInsetTop}px` }}>
      <View className={styles.header}>
        <Text className={styles.title}>历史会话</Text>
        <View className={styles.newChatButton} onClick={handleCreateSession}>
          <Image src={PlusIcon} className={styles.icon} />
          <Text>新对话</Text>
        </View>
      </View>

      <ScrollView scrollY className={styles.sessionList}>
        {isLoading ? (
          <View className={styles.loadingContainer}>
            <View className={styles.loadingSpinner}></View>
            <Text className={styles.loadingText}>加载会话中...</Text>
          </View>
        ) : sessions.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyText}>暂无会话记录</Text>
            <Text className={styles.emptyTip}>点击"新对话"开始聊天</Text>
          </View>
        ) : sessions.map(session => (
          <View
            key={session.id}
            className={`${styles.sessionItem} ${currentSession?.id === session.id ? styles.active : ''}`}
            onClick={() => handleSwitchSession(session.id)}
          >
            {renamingId === session.id ? (
              <Input
                className={styles.renameInput}
                value={renameText}
                onInput={(e) => setRenameText(e.detail.value)}
                onConfirm={(e) => handleConfirmRename(e, session.id)}
                focus
              />
            ) : (
              <Text className={styles.sessionTitle}>{session.title}</Text>
            )}
            
            <View className={styles.actions}>
              {renamingId === session.id ? (
                <Image 
                  src={CheckIcon} 
                  className={styles.actionIcon} 
                  onClick={(e) => handleConfirmRename(e, session.id)}
                  mode="aspectFit"
                />
              ) : (
                <AboutIcon 
                  type="pen-tool" 
                  size={18} 
                  onClick={(e) => handleStartRename(e, session)} 
                  className={styles.actionIcon}
                />
              )}
              <AboutIcon 
                type="x" 
                size={18} 
                onClick={(e) => handleDeleteSession(e, session.id)} 
                className={styles.actionIcon}
              />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
    </>
  )
}

export default ChatSidebar