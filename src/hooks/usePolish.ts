import { useState } from 'react';
import Taro from '@tarojs/taro';
import agentApi from '@/services/api/agent';
import type { ChatRequest } from '@/types/api/agent.d';

/**
 * Wiki润色功能Hook
 * 提供AI文本润色功能，带打字机动画和接受/拒绝选项
 *
 * 核心特性：
 * 1. 智能参数调整：根据文本长度和风格自动设置temperature和max_tokens
 * 2. 短文本优化：对短文本提供上下文提示，生成更有吸引力的表达
 * 3. 风格适配：正式、轻松、幽默、专业四种风格，参数自动调整
 * 4. 打字机动画：润色过程中显示流畅的打字机效果
 * 5. 用户选择：动画结束后显示绿色"采纳"和红色"拒绝"按钮
 *
 * 使用方式：
 * const { loading, polishSuggestion, typingText, isTyping, showOptions, polishTextWithAnimation, acceptPolish, rejectPolish } = usePolish();
 * const result = await polishTextWithAnimation("选课求助", "正式");
 * // 显示动画，结束后显示选项
 * acceptPolish((text) => setContent(text)); // 采纳
 * rejectPolish(); // 拒绝
 */
export const usePolish = () => {
  const [loading, setLoading] = useState(false);
  const [polishSuggestion, setPolishSuggestion] = useState<string>('');
  const [typingText, setTypingText] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  /**
   * 润色文本内容
   * @param text 要润色的文本
   * @param style 润色风格：正式、轻松、幽默、专业等
   * @returns Promise<string> 润色后的文本
   */
  const polishText = async (text: string, style: string = '正式'): Promise<string> => {
    if (!text.trim()) {
      throw new Error('请先输入内容');
    }

    setLoading(true);
    try {
      // 分析原文特征
      const originalText = text.trim();
      const textLength = originalText.length;

      // 根据原文长度动态计算max_tokens和调整策略
      let enhancedText = originalText;
      let contextHint = '';

      if (textLength < 20) {
        // 短文本特殊处理：提供上下文提示，让AI更好地理解和扩展
        if (
          originalText.includes('求助') ||
          originalText.includes('帮助') ||
          originalText.includes('咨询')
        ) {
          contextHint =
            '这是一个求助或咨询信息的标题，请将其润色为更礼貌、更有吸引力的表达方式，适当扩展内容以增加亲和力。';
        } else if (
          originalText.includes('分享') ||
          originalText.includes('经验') ||
          originalText.includes('教程')
        ) {
          contextHint =
            '这是一个分享或教程信息的标题，请将其润色为更吸引人的表达方式，突出价值和实用性。';
        } else if (originalText.includes('通知') || originalText.includes('公告')) {
          contextHint = '这是一个通知或公告信息的标题，请将其润色为更正式、清晰的表达方式。';
        } else {
          contextHint =
            '这是一个简短的标题或主题，请将其润色为更完整、更有吸引力的表达方式，适当扩展内容。';
        }
        // 为短文本提供更多润色空间
        enhancedText = `请${contextHint}原文内容："${originalText}"`;
      }

      // 根据原文长度动态计算max_tokens
      // 短文本给更多token进行扩展，长文本适当增加
      const baseTokens = textLength < 20 ? 800 : 500; // 短文本基础token更多
      const lengthBasedTokens = Math.ceil(textLength * (textLength < 20 ? 3 : 1.5)); // 短文本扩展倍数更大
      const maxTokens = Math.min(baseTokens + lengthBasedTokens, 2000); // 最大不超过2000

      // 根据文风设置不同的参数
      const styleConfigs = {
        正式: {
          temperature: textLength < 20 ? 0.4 : 0.3, // 短文本稍微提高创造性
          systemPrompt: `你是一个专业的文本润色专家。用户发送的任何消息都是需要你润色的文本内容。

你的任务是：
1. 以正式、专业的语气润色用户发送的文本内容
2. 保持原文的核心意思和结构
3. 优化语言表达，使其更加规范、准确和得体
4. 对于短文本（如标题、主题），请适当扩展内容，使其更加完整和有吸引力
5. 直接输出润色后的完整文本，不要添加任何说明、解释、标题或格式标记
6. 不要提及"润色"、"优化"等字样，不要询问用户任何问题，直接输出润色结果

请记住：用户发送的每条消息都是需要润色的文本，直接进行润色并输出结果。`,
        },

        轻松: {
          temperature: textLength < 20 ? 0.6 : 0.5, // 短文本提高创造性
          systemPrompt: `你是一个友好的文本润色助手。用户发送的任何消息都是需要你润色的文本内容。

你的任务是：
1. 以轻松、亲切的语气润色用户发送的文本内容
2. 保持原文的友好感和可读性
3. 使用更自然、流畅的表达方式
4. 对于短文本，请适当扩展内容，增加亲和力和吸引力
5. 直接输出润色后的完整文本，不要添加任何说明、解释或格式标记
6. 让文本读起来更亲切自然

请记住：用户发送的每条消息都是需要润色的文本，直接进行润色并输出结果。`,
        },

        幽默: {
          temperature: textLength < 20 ? 0.9 : 0.8, // 短文本进一步提高创造性
          systemPrompt: `你是一个幽默的文本润色专家。用户发送的任何消息都是需要你润色的文本内容。

你的任务是：
1. 以幽默、风趣的语气润色用户发送的文本内容
2. 适当添加一些轻松有趣的元素，但不要过度夸张
3. 保持原文的核心意思，同时增加趣味性
4. 对于短文本，请创造性地扩展内容，增加幽默感和吸引力
5. 直接输出润色后的完整文本，不要添加任何说明、解释或格式标记
6. 让读者在轻松中获得乐趣

请记住：用户发送的每条消息都是需要润色的文本，直接进行润色并输出结果。`,
        },

        专业: {
          temperature: textLength < 20 ? 0.3 : 0.2, // 短文本稍微提高创造性
          systemPrompt: `你是一个学术和专业文本润色专家。用户发送的任何消息都是需要你润色的文本内容。

你的任务是：
1. 以专业、学术化的语气润色用户发送的文本内容
2. 使用规范的学术语言和专业术语
3. 注重逻辑性和专业性
4. 对于短文本，请扩展为更完整、专业的表达方式
5. 直接输出润色后的完整文本，不要添加任何说明、解释或格式标记
6. 确保文本符合专业标准

请记住：用户发送的每条消息都是需要润色的文本，直接进行润色并输出结果。`,
        },
      };

      const config = styleConfigs[style as keyof typeof styleConfigs] || styleConfigs['正式'];

      const requestData: ChatRequest = {
        message: enhancedText,
        system_prompt: config.systemPrompt,
        temperature: config.temperature,
        max_tokens: maxTokens,
      };

      const response = await agentApi.chatAPI(requestData);

      // 注意：chatAPI 返回的是 BaseResponse<ApiResponse_ChatResponse_>
      // 其中实际内容位于 response.data.data.content
      const inner = response.data;
      const content = inner?.data?.content;
      if (typeof content === 'string') {
        const polishedText = content.trim();

        setPolishSuggestion(polishedText);
        return polishedText;
      }
      const errorMsg = inner?.message || response.message || response.msg || '润色失败，请重试';
      throw new Error(errorMsg);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : '润色失败，请检查网络连接';
      Taro.showToast({
        title: errorMsg,
        icon: 'none',
        duration: 2000,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 打字机动画效果
   * @param text 要显示的文本
   * @param speed 打字速度（毫秒/字符）
   * @returns Promise<void>
   */
  const startTypingAnimation = async (text: string, speed: number = 30): Promise<void> => {
    setIsTyping(true);
    setTypingText('');
    setShowOptions(false);

    for (let i = 0; i <= text.length; i++) {
      setTypingText(text.slice(0, i));
      await new Promise((resolve) => setTimeout(resolve, speed));
    }

    setIsTyping(false);
    setShowOptions(true);
  };

  /**
   * 开始润色并显示动画
   * @param text 要润色的文本
   * @param style 润色风格
   * @returns Promise<string>
   */
  const polishTextWithAnimation = async (text: string, style: string = '正式'): Promise<string> => {
    const result = await polishText(text, style);
    await startTypingAnimation(result);
    return result;
  };

  /**
   * 采纳润色结果
   * @param callback 采纳后的回调函数
   */
  const acceptPolish = (callback?: (_text: string) => void) => {
    if (polishSuggestion && callback) {
      callback(polishSuggestion);
    }
    clearSuggestion();
  };

  /**
   * 拒绝润色结果
   */
  const rejectPolish = () => {
    clearSuggestion();
  };

  /**
   * 清空润色建议
   */
  const clearSuggestion = () => {
    setPolishSuggestion('');
    setTypingText('');
    setIsTyping(false);
    setShowOptions(false);
  };

  return {
    loading,
    polishSuggestion,
    typingText,
    isTyping,
    showOptions,
    polishText,
    polishTextWithAnimation,
    acceptPolish,
    rejectPolish,
    clearSuggestion,
  };
};
