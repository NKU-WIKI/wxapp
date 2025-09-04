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
  Swiper,
  SwiperItem,
  Button, // Added Button import
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

// 默认图片URL（使用本地logo.png作为初始图片）
const defaultImageUrl = '/assets/logo.png';

export default function PublishNote() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  // 状态管理
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>(['/assets/logo.png']); // 本地图片路径数组
  const [localImages, setLocalImages] = useState<Array<{path: string, size: number, compressed: boolean}>>([]); // 本地图片信息
  const [isUploading, setIsUploading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showImageOverview, setShowImageOverview] = useState(false); // 图片总览弹窗状态
  const [imageAspectRatio, setImageAspectRatio] = useState<number>(1); // 图片长宽比，默认为1（正方形）
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // 当前显示的图片索引
  
  // 检查是否为默认图片（本地logo图片）
  const isDefaultImage = (imagePath: string) => {
    return imagePath === defaultImageUrl || imagePath === '/assets/logo.png';
  };

  // 计算图片长宽比
  const calculateImageAspectRatio = (imagePath: string): Promise<number> => {
    return new Promise((resolve) => {
      // 使用Taro的getImageInfo API来获取图片信息
      Taro.getImageInfo({
        src: imagePath,
        success: (res) => {
          const ratio = res.height / res.width;
          resolve(ratio);
        },
        fail: () => {
          resolve(1); // 如果获取失败，使用默认比例1
        }
      });
    });
  };

  // 更新图片长宽比
  const updateImageAspectRatio = async (imagePath: string) => {
    const ratio = await calculateImageAspectRatio(imagePath);
    setImageAspectRatio(ratio);
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
      // 计算logo.png的长宽比
      calculateImageAspectRatio(defaultImageUrl).then(setImageAspectRatio);
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

  // 监听图片数组变化，自动更新长宽比
  useEffect(() => {
    if (images.length > 0) {
      // 始终以第一张图片的长宽比为准
      updateImageAspectRatio(images[0]);
    }
  }, [images]);

  // 处理图片轮播变化
  const handleImageChange = (e: any) => {
    setCurrentImageIndex(e.detail.current);
  };

  // 处理图片上传
  const handleImageUpload = async () => {
    try {
      setIsUploading(true);
      
      const res = await Taro.chooseImage({
        count: 9 - images.length,
        sizeType: ['original'], // 选择原图，本地压缩
        sourceType: ['album', 'camera'],
      });

      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        // 本地压缩处理，不上传到服务器
        const compressedImages = await Promise.all(
          res.tempFilePaths.map(async (tempPath) => {
            try {
              // 获取原图信息
              const fileInfo = await Taro.getFileInfo({ filePath: tempPath });
              let originalSize = 0;
              
              if ('size' in fileInfo) {
                originalSize = fileInfo.size;
              }
              
              // 如果图片超过1MB，进行本地压缩
              let finalPath = tempPath;
              let compressed = false;
              
              if (originalSize > 1024 * 1024) { // 超过1MB
                console.log(`🔄 本地压缩图片: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);
                
                // 使用智能压缩到1MB以下
                const { smartCompressImage } = await import('@/utils/image');
                finalPath = await smartCompressImage(tempPath, 1024, 0.85);
                
                // 检查压缩后的大小
                const compressedInfo = await Taro.getFileInfo({ filePath: finalPath });
                let compressedSize = 0;
                
                if ('size' in compressedInfo) {
                  compressedSize = compressedInfo.size;
                }
                
                console.log(`✅ 本地压缩完成: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(compressedSize / 1024 / 1024).toFixed(2)}MB`);
                compressed = true;
              }
              
              return {
                path: finalPath,
                size: originalSize,
                compressed: compressed
              };
            } catch (error) {
              console.error('图片处理失败:', error);
              return {
                path: tempPath,
                size: 0,
                compressed: false
              };
            }
          })
        );

        // 更新本地图片信息
        setLocalImages(prev => [...prev, ...compressedImages]);
        
        // 更新显示图片路径
        const newImagePaths = compressedImages.map(img => img.path);
        setImages(prev => [...prev, ...newImagePaths]);
        
        Taro.showToast({
          title: `已添加${compressedImages.length}张图片`,
          icon: 'success',
          duration: 2000,
        });
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
          return prev;
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
          return prev;
        }
        newImages.splice(index, 1);
      }
      
      return newImages;
    });
    
    // 同时从本地图片信息中删除
    setLocalImages(prev => {
      const newLocalImages = [...prev];
      if (index < newLocalImages.length) {
        newLocalImages.splice(index, 1);
      }
      return newLocalImages;
    });
    
    // 如果删除的是当前显示的图片，调整索引
    if (index === currentImageIndex && images.length > 1) {
      const newIndex = Math.min(currentImageIndex, images.length - 2);
      setCurrentImageIndex(newIndex);
    }
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
  const currentDisplayImage = images.length > 0 ? images[currentImageIndex] : null;

  // 检查当前显示图片是否为默认图片
  const isCurrentImageDefault = currentDisplayImage ? isDefaultImage(currentDisplayImage) : false;

  // 发布笔记
  const handlePublish = async () => {
    if (!title.trim()) {
      Taro.showToast({
        title: '请输入标题',
        icon: 'none',
        duration: 2000,
      });
      return;
    }

    if (!content.trim()) {
      Taro.showToast({
        title: '请输入内容',
        icon: 'none',
        duration: 2000,
      });
      return;
    }

    try {
      setIsPublishing(true);
      
      // 先上传所有图片到服务器
      const imageUrls: string[] = [];
      
      if (images.length > 0) {
        Taro.showLoading({ title: '正在上传图片...' });
        
        // 过滤掉默认logo图片，只上传用户添加的图片
        const userImages = localImages.filter(img => !img.path.includes('/assets/logo.png'));
        
        if (userImages.length > 0) {
          const uploadPromises = userImages.map(async (imgInfo) => {
            try {
              const uploadResult = await uploadApi.uploadImage(imgInfo.path, { compress: false }); // 本地已压缩，直接上传
              return uploadResult;
            } catch (error) {
              console.error('图片上传失败:', error);
              throw new Error(`图片上传失败: ${error}`);
            }
          });

          const uploadedUrls = await Promise.all(uploadPromises);
          imageUrls.push(...uploadedUrls);
        }
        
        Taro.hideLoading();
      }

      // 发布笔记
      const response = await dispatch(
        createNote({
          title: title.trim(),
          content: content.trim(),
          images: imageUrls,
          allow_comment: true,
          allow_share: true,
          category_id: 'c1a7e7e4-a5b6-4c1c-8d8e-9e9f9f9f9f9f', // 示例分类ID，实际应从后端获取
        })
      ).unwrap();

      if (response.code === 0) {
        Taro.showToast({
          title: '发布成功',
          icon: 'success',
          duration: 2000,
        });

        // 发布成功后返回上一页
        setTimeout(() => {
          Taro.navigateBack();
        }, 2000);
      } else {
        throw new Error(response.message || '发布失败');
      }
    } catch (error: any) {
      console.error('发布失败:', error);
      Taro.showToast({
        title: error.message || '发布失败，请重试',
        icon: 'none',
        duration: 3000,
      });
    } finally {
      setIsPublishing(false);
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
          <View 
            className={styles.imageSection}
          >
            <View 
              className={styles.imageGrid}
              style={{
                height: `${Math.max(200, 300 * imageAspectRatio)}px` // 根据长宽比动态调整高度
              }}
            >
              {/* 显示图片轮播 */}
              {images.length > 0 && (
                <Swiper
                  className={styles.imageSwiper}
                  indicatorDots={false}
                  autoplay={false}
                  onChange={handleImageChange}
                >
                  {images.map((image, index) => (
                    <SwiperItem key={index}>
                      <View className={styles.imageItem}>
                        <Image 
                          src={image}
                          className={styles.image}
                          mode="aspectFit"
                          onClick={handleShowImageOverview}
                        />
                        
                        {/* 图片数量提示 - 左上角 */}
                        <Text className={styles.imageCount}>
                          {images.length}/9
                        </Text>
                        
                        {/* 移除图片按钮 - 右上角 */}
                        {(!isDefaultImage(image) || images.length > 1) && (
                          <View 
                            className={styles.removeButton}
                            onClick={() => handleRemoveImage(index)}
                          >
                            <Text className={styles.removeIcon}>×</Text>
                          </View>
                        )}
                      </View>
                    </SwiperItem>
                  ))}
                </Swiper>
              )}
              
              {/* 图片计数器 */}
              {images.length > 1 && (
                <Text className={styles.imageCounter}>
                  {currentImageIndex + 1}/{images.length}
                </Text>
              )}
              
              {/* 图片指示点 */}
              {images.length > 1 && (
                <View className={styles.imageDots}>
                  {images.map((_, index) => (
                    <View 
                      key={index} 
                      className={`${styles.dot} ${index === currentImageIndex ? styles.active : ''}`}
                    />
                  ))}
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
            >
              <Button 
                className={styles.publishBtn}
                onClick={handlePublish}
                disabled={isPublishing || !title.trim() || !content.trim()}
              >
                {isPublishing ? '发布中...' : '发布笔记'}
              </Button>
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
