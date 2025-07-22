import { View, ScrollView, Text, Textarea, Image } from "@tarojs/components";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import Taro from "@tarojs/taro";
import CustomHeader from "@/components/custom-header";
import { ChatMessage } from "@/types/chat";
import {
  addMessage,
  streamMessageFromAI,
  initializeChat,
} from "@/store/slices/chatSlice";
import { RootState, AppDispatch } from "@/store";
import styles from "./index.module.scss";

// 导入本地资源
import RobotAvatar from "@/assets/wiki.svg";
import DefaultUserAvatar from "@/assets/profile.svg"; // 默认用户头像
import SendIcon from "@/assets/send.svg";
import MenuIcon from "@/assets/more-horizontal.svg";
import ChatSidebar from "./components/chat-sidebar/index";

const Chat = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentSession, isTyping, isLoading, error, sessions } = useSelector(
    (state: RootState) => state.chat || {
      currentSession: null,
      isTyping: false,
      isLoading: false,
      error: null,
      sessions: []
    }
  );
  const { userInfo, isLoggedIn } = useSelector(
    (state: RootState) => state.user || {
      userInfo: null,
      isLoggedIn: false
    }
  );

  const [inputText, setInputText] = useState("");
  const [scrollTop, setScrollTop] = useState(9999); // 初始化一个较大的值以滚动到底部
  const scrollViewRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchingKnowledge, setIsSearchingKnowledge] = useState(false);

  // 初始化聊天状态
  useEffect(() => {
    dispatch(initializeChat());
  }, [dispatch]);

  // 当消息更新时自动滚动到底部
  useEffect(() => {
    if (currentSession?.messages && currentSession.messages.length > 0) {
      Taro.nextTick(() => {
        setScrollTop((prev) => prev + 10000); // 增加 scrollTop 以确保滚动到底部
      });
    }
  }, [currentSession?.messages?.length, isTyping]);

  const handleSend = async () => {
    if (inputText.trim() && currentSession?.id) {
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        content: inputText.trim(),
        role: "user",
        timestamp: Date.now(),
      };

      dispatch(addMessage(userMessage));

      const messageContent = inputText.trim();
      setInputText("");

      // 显示正在搜索知识库的状态
      setIsSearchingKnowledge(true);

      // 发送消息到AI
      dispatch(
        streamMessageFromAI({
          message: messageContent,
          sessionId: currentSession.id,
        })
      ).finally(() => {
        // 无论成功失败，都结束搜索状态
        setIsSearchingKnowledge(false);
      });
    }
  };

  // 参考资料折叠/展开状态管理
  const [expandedReferences, setExpandedReferences] = useState<
    Record<string, boolean>
  >({});

  // 切换参考资料的折叠/展开状态
  const toggleReferenceExpand = (messageId: string) => {
    setExpandedReferences((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const renderMessage = (message: ChatMessage) => {
    if (!message || !message.id) {
      return null;
    }

    const isUser = message.role === "user";
    const hasReferences =
      !isUser &&
      message.references &&
      Array.isArray(message.references) &&
      message.references.length > 0;
    const isExpanded = expandedReferences[message.id] || false;

    return (
      <View
        key={message.id}
        className={`${styles.messageItem} ${
          isUser ? styles.userMessage : styles.assistantMessage
        }`}
      >
        <Image
          src={
            isUser
              ? isLoggedIn && userInfo?.avatar
                ? userInfo.avatar
                : DefaultUserAvatar
              : RobotAvatar
          }
          className={styles.avatar}
        />
        <View className={styles.messageContent}>
          <View
            className={`${styles.messageBubble} ${
              isUser ? styles.userBubble : styles.assistantBubble
            }`}
          >
            <Text selectable>{message.content}</Text>
            {message.isStreaming && <View className={styles.streamingCursor} />}
          </View>

          {/* 参考资料区域 */}
          {hasReferences && (
            <View className={styles.referencesContainer}>
              <View
                className={`${styles.referencesToggle} ${isExpanded ? styles.expanded : ''}`}
                onClick={() => toggleReferenceExpand(message.id)}
              >
                <Text className={styles.referencesToggleText}>
                  {isExpanded ? "收起参考资料" : "查看参考资料"} (
                  {message.references?.length || 0})
                </Text>
              </View>

              {isExpanded && (
                <View className={styles.referencesList}>
                  {message.references?.map((reference, index) => (
                    <View key={index} className={styles.referenceItem}>
                      <Text className={styles.referenceIndex}>
                        {index + 1}
                      </Text>
                      <View className={styles.referenceContent}>
                        <Text className={styles.referenceTitle}>
                          {reference.title}
                        </Text>
                        <Text className={styles.referenceText}>
                          {reference.content}
                        </Text>
                        {reference.original_url && (
                          <Text className={styles.referenceLink}>
                            来源: {reference.platform || "未知来源"}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderWelcome = () => (
    <View className={styles.welcomeContainer}>
      <Image src={RobotAvatar} className={styles.welcomeLogo} />
      <Text className={styles.welcomeTitle}>南开小知</Text>
      <Text className={styles.welcomeTip}>南开知识社区的智能助理</Text>
    </View>
  );

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
          {isSearchingKnowledge && (
            <Text className={styles.searchingText}>正在搜索南开知识库...</Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View className={styles.chatPage}>
      <CustomHeader
        title="南开小知"
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
          {!currentSession?.messages || currentSession.messages.length === 0
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
          placeholder="有关南开的问题，尽管问我..."
          value={inputText}
          onInput={(e) => setInputText(e.detail.value)}
          autoHeight
          maxlength={-1}
          showConfirmBar={false}
          confirmType="send"
          disabled={isTyping}
          onConfirm={handleSend}
        />
        <View
          className={`${styles.sendButton} ${
            !inputText.trim() || isTyping ? styles.sendButtonDisabled : ""
          }`}
          onClick={handleSend}
        >
          <Image src={SendIcon} className={styles.sendIcon} />
        </View>
      </View>
    </View>
  );
};

export default Chat;
