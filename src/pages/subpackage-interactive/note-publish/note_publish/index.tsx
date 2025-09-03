import { useState, useEffect, useCallback } from "react";
import Taro, { useRouter, useUnload } from "@tarojs/taro";
import { useDispatch, useSelector } from "react-redux";
import {
  View,
  Text,
  Input,
  Textarea,
  Image,
  ScrollView,
} from "@tarojs/components";

// Absolute imports (alphabetical order)
import { AppDispatch, RootState } from "@/store";
import CustomHeader from "@/components/custom-header";
import { createNote } from '@/store/slices/noteSlice';
import { uploadApi } from "@/services/api/upload";

// Asset imports
import plusIcon from "@/assets/plus.svg";
import penToolIcon from "@/assets/pen-tool.svg";

// Relative imports
import styles from "./index.module.scss";

// 默认图片URL（从后端获取，或者使用一个通用的占位图片URL）
const defaultImageUrl = 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=笔记封面';

export default function PublishNote() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("c1a7e7e4-a5b6-4c1c-8d8e-9e9f9f9f9f9f"); // 默认选择学习交流分类
  const [showImageOverview, setShowImageOverview] = useState(false); // 图片总览弹窗状态
  
  // 检查是否为默认图片（在线占位图片）
  const isDefaultImage = (imagePath: string) => {
    return imagePath === defaultImageUrl || imagePath.includes('placeholder.com');
  };

  // 获取可删除的图片数量（非默认图片）
  const getDeletableImageCount = () => {
    return images.filter(img => !isDefaultImage(img)).length;
  };

  // 检查是否至少有一张用户上传的图片
  const hasUserImages = () => {
    return images.some(img => !isDefaultImage(img));
  };

  // 初始化默认图片和预填内容
  useEffect(() => {
    if (images.length === 0) {
      setImages([defaultImageUrl]);
    }
    
    // 处理预填内容
    const prefillContent = router?.params?.prefillContent;
    if (prefillContent) {
      try {
        const decodedContent = decodeURIComponent(prefillContent);
        setContent(decodedContent);
        
        // 如果内容较长，可以自动生成标题
        if (decodedContent.length > 20) {
          const autoTitle = decodedContent.substring(0, 20) + '...';
          setTitle(autoTitle);
        }
      } catch (error) {
        console.error('解析预填内容失败:', error);
      }
    }
  }, [router?.params?.prefillContent]);

  // 处理图片上传
  const handleImageUpload = async () => {
    try {
      setIsUploading(true);
      
      const res = await Taro.chooseImage({
        count: 9 - images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      });

      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        const uploadPromises = res.tempFilePaths.map(async (tempPath) => {
          try {
            const uploadResult = await uploadApi.uploadImage(tempPath);
            return uploadResult;
          } catch (error) {
            console.error('图片上传失败:', error);
            return null;
          }
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        const validUrls = uploadedUrls.filter(url => url !== null);
        
        if (validUrls.length > 0) {
          setImages(prev => [...prev, ...validUrls]);
        }
      }
    } catch (error) {
      console.error('选择图片失败:', error);
      Taro.showToast({
        title: '选择图片失败',
        icon: 'none',
        duration: 2000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  // 移除图片
  const handleRemoveImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      const imageToRemove = newImages[index];
      
      // 检查是否为默认图片
      if (isDefaultImage(imageToRemove)) {
        // 如果是默认图片，检查是否还有其他图片
        if (newImages.length > 1) {
          newImages.splice(index, 1);
        } else {
          // 如果只有一张图片，不允许删除，提示用户
          Taro.showToast({
            title: '至少需要保留一张图片',
            icon: 'none',
            duration: 2000,
          });
          return prev; // 返回原数组，不进行删除
        }
      } else {
        // 如果不是默认图片，检查删除后是否还有图片
        const remainingImages = newImages.filter((_, i) => i !== index);
        if (remainingImages.length === 0) {
          // 如果删除后没有图片了，不允许删除
          Taro.showToast({
            title: '至少需要保留一张图片',
            icon: 'none',
            duration: 2000,
          });
          return prev; // 返回原数组，不进行删除
        }
        // 可以删除
        newImages.splice(index, 1);
      }
      
      return newImages;
    });
  };

  // 显示图片总览弹窗
  const handleShowImageOverview = () => {
    setShowImageOverview(true);
  };

  // 关闭图片总览弹窗
  const handleCloseImageOverview = () => {
    setShowImageOverview(false);
  };

  // 获取当前显示的图片（用于界面显示）
  const currentDisplayImage = images.length > 0 ? images[0] : null;
  
  // 检查当前显示图片是否为默认图片
  const isCurrentImageDefault = currentDisplayImage ? isDefaultImage(currentDisplayImage) : false;

  // 处理发布
  const handlePublish = async () => {
    if (!title.trim()) {
      Taro.showToast({
        title: "请输入笔记标题",
        icon: "none",
        duration: 2000,
      });
      return;
    }
    
    if (!content.trim()) {
      Taro.showToast({
        title: "请输入笔记内容",
        icon: "none",
        duration: 2000,
      });
      return;
    }

    try {
      // 过滤掉默认图片，只保留用户上传的图片
      const userImages = images.filter(img => !isDefaultImage(img));
      
      await dispatch(
        createNote({
          title,
          content,
          status: 'published',
          images: userImages,
          visibility: 'PUBLIC',
          allow_comment: true,
          allow_share: true,
          category_id: selectedCategory,
        })
      ).unwrap();

      Taro.showToast({
        title: "笔记发布成功",
        icon: "success",
        duration: 1500,
      });

      // 1.5秒后跳转到首页并强制刷新
      setTimeout(() => {
        Taro.reLaunch({
          url: '/pages/home/index?refresh=true',
        });
      }, 1500);
    } catch (error: any) {
      Taro.showToast({
        title: error || "笔记发布失败",
        icon: "none",
        duration: 2000,
      });
    }
  };

  return (
    <View className={styles.pageContainer}>
      <CustomHeader title="发布笔记" />
      
      <View className={styles.contentWrapper}>
        <ScrollView
          scrollY
          className={styles.scrollView}
          enableBackToTop
        >
          {/* 图片上传区域 */}
          <View className={styles.imageSection}>
            <View className={styles.imageGrid}>
              {/* 显示当前图片 */}
              {currentDisplayImage && (
                <View className={styles.imageItem}>
                  <Image
                    src={currentDisplayImage}
                    className={styles.image}
                    mode="aspectFill"
                    onClick={handleShowImageOverview}
                  />
                  
                  {/* 图片数量提示 - 左上角 */}
                  <Text className={styles.imageCount}>
                    {images.length}/9
                  </Text>
                  
                  {/* 移除图片按钮 - 右上角 */}
                  {(!isCurrentImageDefault || images.length > 1) && (
                    <View 
                      className={styles.removeButton}
                      onClick={() => handleRemoveImage(0)}
                    >
                      <Text className={styles.removeIcon}>×</Text>
                    </View>
                  )}
                  
                  {/* 添加图片按钮 - 右下角 */}
                  {images.length < 9 && (
                    <View 
                      className={styles.addImageButton}
                      onClick={handleImageUpload}
                    >
                      <Image src={plusIcon} className={styles.plusIcon} />
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* 标题输入 */}
          <View className={styles.inputSection}>
            <Text className={styles.inputLabel}>笔记标题</Text>
            <Input
              className={styles.titleInput}
              placeholder="为你的笔记添加一个标题"
              value={title}
              onInput={(e) => setTitle(e.detail.value)}
              maxlength={100}
            />
          </View>

          {/* 内容输入 */}
          <View className={styles.inputSection}>
            <Text className={styles.inputLabel}>笔记内容</Text>
            <Textarea
              className={styles.contentInput}
              placeholder="详细介绍资源内容、适用人群、学习建议..."
              value={content}
              onInput={(e) => setContent(e.detail.value)}
              maxlength={2000}
              autoHeight
            />
          </View>

          {/* 资源链接区域 - 预留位置 */}
          <View className={styles.resourceSection}>
            <Text className={styles.sectionTitle}>资源链接</Text>
            <Text className={styles.comingSoon}>功能开发中，敬请期待...</Text>
          </View>

          {/* 发布按钮 */}
          <View className={styles.publishSection}>
            <View 
              className={styles.publishButton}
              onClick={handlePublish}
            >
              <Text className={styles.publishText}>发布笔记</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* 图片总览弹窗 */}
      {showImageOverview && (
        <View className={styles.imageOverviewOverlay} onClick={handleCloseImageOverview}>
          <View className={styles.imageOverviewModal} onClick={(e) => e.stopPropagation()}>
            <View className={styles.imageOverviewHeader}>
              <Text className={styles.imageOverviewTitle}>图片总览 ({images.length}/9)</Text>
              <View className={styles.imageOverviewClose} onClick={handleCloseImageOverview}>
                <Text style={{ fontSize: '20px', color: '#666' }}>×</Text>
              </View>
            </View>
            
            <View className={styles.imageOverviewGrid}>
              {images.map((image, index) => (
                <View key={index} className={styles.imageOverviewItem}>
                  <Image
                    src={image}
                    className={styles.imageOverviewImage}
                    mode="aspectFill"
                  />
                  {/* 删除按钮 - 只有非默认图片才显示，或者有多张图片时默认图片也可以删除 */}
                  {(!isDefaultImage(image) || images.length > 1) && (
                    <View 
                      className={styles.imageOverviewDelete}
                      onClick={() => {
                        handleRemoveImage(index);
                        // 如果删除后没有图片了，关闭弹窗
                        if (images.length <= 1) {
                          handleCloseImageOverview();
                        }
                      }}
                    >
                      <Text className={styles.imageOverviewDeleteIcon}>×</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
