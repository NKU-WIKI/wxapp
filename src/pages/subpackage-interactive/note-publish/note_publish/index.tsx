import { useState, useEffect, useCallback } from "react";
import Taro, { useRouter } from "@tarojs/taro";
import { useDispatch } from "react-redux";
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
import { AppDispatch } from "@/store";
import CustomHeader from "@/components/custom-header";
import { createNote } from '@/store/slices/noteSlice';
import { uploadApi } from "@/services/api/upload";
import { checkFileUploadPermissionWithToast } from "@/utils/permissionChecker";

// Asset imports
import plusIcon from "@/assets/plus.svg";
import cameraIcon from "@/assets/camera.svg";

// Relative imports
import styles from "./index.module.scss";

export default function PublishNote() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  // 状态管�?  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]); // 本地图片路径数组
  const [localImages, setLocalImages] = useState<Array<{ path: string, size: number, compressed: boolean }>>([]); // 本地图片信息
  const [isPublishing, setIsPublishing] = useState(false);
  const [showImageOverview, setShowImageOverview] = useState(false); // 图片总览弹窗状态
  const [imageAspectRatio, setImageAspectRatio] = useState<number>(1); // 图片长宽比，默认1（正方形）
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // 当前显示的图片索引  

  // 计算图片长宽�?  const calculateImageAspectRatio = (imagePath: string): Promise<number> => {
  return new Promise((resolve) => {
    // 使用Taro的getImageInfo API来获取图片信息
      Taro.getImageInfo({
    src: imagePath,
      success: (res) => {
        const ratio = res.height / res.width;
        resolve(ratio);
      },
        fail: () => {
          resolve(1); // 如果获取失败，使用默认比�?
        }
  });
});
  };

// 更新图片长宽�?  const updateImageAspectRatio = useCallback(async (imagePath: string) => {
const ratio = await calculateImageAspectRatio(imagePath);
setImageAspectRatio(ratio);
  }, []);


// 初始化预填内�?  useEffect(() => {
// 处理预填内容
const prefillContent = router?.params?.prefillContent;
if (prefillContent) {
  try {
    const decodedContent = decodeURIComponent(prefillContent);
    setContent(decodedContent);

    // 如果内容较长，可以自动生成标�?        if (decodedContent.length > 20) {
    const autoTitle = decodedContent.substring(0, 20) + '...';
    setTitle(autoTitle);
  }
      } catch (error) {
}
    }
  }, [router?.params?.prefillContent]);

// 监听图片数组变化，自动更新长宽比
useEffect(() => {
  if (images.length > 0) {
    // 始终以第一张图片的长宽比为�?      updateImageAspectRatio(images[0]);
  }
}, [images, updateImageAspectRatio]);

// 处理图片轮播变化
const handleImageChange = (e: any) => {
  setCurrentImageIndex(e.detail.current);
};

// 处理图片上传
const handleImageUpload = async () => {
  // 检查文件上传权�?    if (!checkFileUploadPermissionWithToast()) {
  return;
}

try {

  const res = await Taro.chooseImage({
    count: 9 - images.length,
    sizeType: ['original'], // 选择原图，本地压�?        sourceType: ['album', 'camera'],
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

          // 如果图片超过1MB，进行本地压�?              let finalPath = tempPath;
          let compressed = false;

          if (originalSize > 1024 * 1024) { // 超过1MB
            // 使用智能压缩�?MB以下
            const { smartCompressImage } = await import('@/utils/image');
            finalPath = await smartCompressImage(tempPath, 1024, 0.85);


            compressed = true;
          }

          return {
            path: finalPath,
            size: originalSize,
            compressed: compressed
          };
        } catch (error) {
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
      title: `已添�?{compressedImages.length}张图片`,
      icon: 'success',
      duration: 2000,
    });
  }
} catch (error) {
  // 检查是否是用户取消操作
  if (error && typeof error === 'object' && 'errMsg' in error) {
    const errMsg = (error as any).errMsg;
    if (errMsg && errMsg.includes('cancel')) {
      // 用户取消是正常行为，不显示错误提�?          return;
    }
  }

  // 其他错误才显示提�?      Taro.showToast({
  title: '选择图片失败',
    icon: 'none',
      duration: 2000,
      });
    }
  };

// 移除图片
const handleRemoveImage = (index: number) => {
  setImages(prev => {
    const newImages = [...prev];
    newImages.splice(index, 1);
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


// 发布笔记
const handlePublish = async () => {
  if (!title.trim()) {
    Taro.showToast({
      title: '请输入标�?,
        icon: 'none',
      duration: 2000,
    });
    return;
  }

  if (title.trim().length < 4) {
    Taro.showToast({
      title: '标题至少需�?个字�?,
        icon: 'none',
      duration: 2000,
    });
    return;
  }

  if (title.trim().length > 20) {
    Taro.showToast({
      title: '标题最�?0个字�?,
        icon: 'none',
      duration: 2000,
    });
    return;
  }

  if (!content.trim()) {
    Taro.showToast({
      title: '请输入内�?,
        icon: 'none',
      duration: 2000,
    });
    return;
  }

  try {
    setIsPublishing(true);

    // 先上传所有图片到服务�?      const imageUrls: string[] = [];

    if (images.length > 0) {
      Taro.showLoading({ title: '正在上传图片...' });

      if (localImages.length > 0) {
        const uploadPromises = localImages.map(async (imgInfo) => {
          try {
            const uploadResult = await uploadApi.uploadImage(imgInfo.path, { compress: false }); // 本地已压缩，直接上传
            return uploadResult;
          } catch (error) {
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
        category_id: 'c1a7e7e4-a5b6-4c1c-8d8e-9e9f9f9f9f9f', // 示例分类ID，实际应从后端获�?        })
      ).unwrap();

    if (response.code === 0) {
      Taro.showToast({
        title: '发布成功',
        icon: 'success',
        duration: 2000,
      });

      // 发布成功后返回上一�?        setTimeout(() => {
      Taro.navigateBack();
    }, 2000);
  } else {
    throw new Error(response.message || '发布失败');
  }
} catch (error: any) {
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
    <CustomHeader title='发布笔记' />

    <View className={styles.contentWrapper}>
      <ScrollView
        scrollY
        className={styles.scrollView}
        enableBackToTop
      >
        {/* 图片上传区域 */}
        <View className={styles.imageSection}>
          <View
            className={styles.imageGrid}
            style={{
              height: images.length > 0 ? `${Math.max(200, 300 * imageAspectRatio)}px` : '200px'
            }}
          >
            {/* 图片占位�?- 当没有图片时显示 */}
            {images.length === 0 && (
              <View
                className={styles.imagePlaceholder}
                onClick={handleImageUpload}
              >
                <View className={styles.placeholderContent}>
                  <Image
                    src={cameraIcon}
                    className={styles.placeholderCameraIcon}
                  />
                  <Image
                    src={plusIcon}
                    className={styles.placeholderPlusIcon}
                  />
                </View>
                <Text className={styles.placeholderText}>点击添加图片</Text>
              </View>
            )}

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
                        mode='aspectFit'
                        onClick={handleShowImageOverview}
                      />

                      {/* 图片数量提示 - 左上�?*/}
                      <Text className={styles.imageCount}>
                        {images.length}/9
                      </Text>

                      {/* 移除图片按钮 - 右上�?*/}
                      <View
                        className={styles.removeButton}
                        onClick={() => handleRemoveImage(index)}
                      >
                        <Text className={styles.removeIcon}>×</Text>
                      </View>
                    </View>
                  </SwiperItem>
                ))}
              </Swiper>
            )}

            {/* 图片计数�?*/}
            {images.length > 1 && (
              <Text className={styles.imageCounter}>
                {currentImageIndex + 1}/{images.length}
              </Text>
            )}

            {/* 图片指示�?*/}
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

            {/* 添加图片按钮 - 右下�?*/}
            {images.length > 0 && images.length < 9 && (
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
          <View className={styles.inputHeader}>
            <Text className={styles.inputLabel}>笔记标题</Text>
            <Text className={styles.titleCount}>{title.length}/20</Text>
          </View>
          <Input
            className={styles.titleInput}
            placeholder='为你的笔记添加一个标题（4-20个字符）'
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
            maxlength={20}
          />
        </View>

        {/* 内容输入 */}
        <View className={styles.inputSection}>
          <Text className={styles.inputLabel}>笔记内容</Text>
          <Textarea
            className={styles.contentInput}
            placeholder='详细介绍资源内容、适用人群、学习建�?..'
            value={content}
            onInput={(e) => setContent(e.detail.value)}
            maxlength={2000}
            autoHeight
          />
        </View>



        {/* 发布按钮 */}
        <View className={styles.publishSection}>
          <Button
            className={styles.publishBtn}
            onClick={handlePublish}
            disabled={isPublishing || !title.trim() || !content.trim()}
          >
            {isPublishing ? '发布�?..' : '发布笔记'}
          </Button>
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
                  mode='aspectFill'
                />
                {/* 删除按钮 */}
                <View
                  className={styles.imageOverviewDelete}
                  onClick={() => {
                    handleRemoveImage(index);
                    // 如果删除后没有图片了，关闭弹�?                      if (images.length <= 1) {
                    handleCloseImageOverview();
                  }
                  }}
                  >
                <Text className={styles.imageOverviewDeleteIcon}>×</Text>
              </View>
                </View>
                ))}
        </View>
      </View>
        </View>
)}
    </View >
  );
}
