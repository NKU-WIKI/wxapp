import { View, ScrollView, Text, Image, Input } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState, useEffect, useCallback } from "react";
import AuthFloatingButton from "@/components/auth-floating-button";
import LearningMaterialService, { CATEGORY_CONFIG } from "@/services/api/learningMaterial";
import { LearningMaterial, LearningMaterialCategory } from "@/types/api/learningMaterial";
import styles from "./index.module.scss";

// eslint-disable-next-line import/no-unused-modules
export default function LearningMaterials() {
  const [searchValue, setSearchValue] = useState("");
  const [activeTag, setActiveTag] = useState("全部");
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [allMaterials, setAllMaterials] = useState<LearningMaterial[]>([]);
  const [categoryStats, setCategoryStats] = useState<Record<LearningMaterialCategory, number>>({
    [LearningMaterialCategory.COURSE_NOTES]: 0,
    [LearningMaterialCategory.FINAL_EXAM]: 0,
    [LearningMaterialCategory.EBOOK]: 0,
    [LearningMaterialCategory.GRADUATE_EXAM]: 0,
    [LearningMaterialCategory.LAB_REPORT]: 0,
    [LearningMaterialCategory.OTHER]: 0,
  });

  // 加载数据
  useEffect(() => {
    loadMaterials();
    // 检查是否有上传的数据需要导入
    const newMaterial = LearningMaterialService.checkAndImportUploadData();
    if (newMaterial) {
      Taro.showToast({
        title: "资料已成功保存",
        icon: "success"
      });
      // 重新加载数据
      setTimeout(() => {
        loadMaterials();
      }, 1000);
    }
  }, []);

  const filterMaterials = useCallback(() => {
    let filtered = allMaterials;

    // 根据搜索值筛选
    if (searchValue.trim()) {
      filtered = LearningMaterialService.searchMaterials(searchValue);
    }

    // 根据标签筛选
    if (activeTag !== "全部") {
      let category: LearningMaterialCategory | null = null;
      switch (activeTag) {
        case "考研资料":
          category = LearningMaterialCategory.GRADUATE_EXAM;
          break;
        case "期末考试":
          category = LearningMaterialCategory.FINAL_EXAM;
          break;
        case "课程笔记":
          category = LearningMaterialCategory.COURSE_NOTES;
          break;
        case "实验报告":
          category = LearningMaterialCategory.LAB_REPORT;
          break;
      }
      if (category) {
        filtered = filtered.filter(material => material.category === category);
      }
    }

    // 更新显示的材料
    setMaterials(filtered);
  }, [searchValue, activeTag, allMaterials]);

  // 当搜索值或标签改变时，更新筛选结果
  useEffect(() => {
    filterMaterials();
  }, [filterMaterials]);

  const loadMaterials = () => {
    const materialData = LearningMaterialService.getAllMaterials();
    const stats = LearningMaterialService.getCategoryStats();
    setAllMaterials(materialData);
    setMaterials(materialData);
    setCategoryStats(stats);
  };

  // 标签数据
  const tags = ["全部", "考研资料", "期末考试", "课程笔记", "实验报告"];

  // 分类卡片数据 - 使用真实统计数据
  const categories = [
    {
      id: "1",
      title: "课程笔记",
      count: `${categoryStats[LearningMaterialCategory.COURSE_NOTES]} 份资料`,
      icon: CATEGORY_CONFIG[LearningMaterialCategory.COURSE_NOTES].icon,
      type: "notes",
      category: LearningMaterialCategory.COURSE_NOTES
    },
    {
      id: "2", 
      title: "期末真题",
      count: `${categoryStats[LearningMaterialCategory.FINAL_EXAM]} 份资料`,
      icon: CATEGORY_CONFIG[LearningMaterialCategory.FINAL_EXAM].icon,
      type: "exam",
      category: LearningMaterialCategory.FINAL_EXAM
    },
    {
      id: "3",
      title: "电子书",
      count: `${categoryStats[LearningMaterialCategory.EBOOK]} 本书籍`, 
      icon: CATEGORY_CONFIG[LearningMaterialCategory.EBOOK].icon,
      type: "book",
      category: LearningMaterialCategory.EBOOK
    },
    {
      id: "4",
      title: "考研资料",
      count: `${categoryStats[LearningMaterialCategory.GRADUATE_EXAM]} 份资料`,
      icon: CATEGORY_CONFIG[LearningMaterialCategory.GRADUATE_EXAM].icon,
      type: "graduate",
      category: LearningMaterialCategory.GRADUATE_EXAM
    }
  ];

  // 返回上一页
  const handleBack = () => {
    Taro.navigateBack();
  };

  // 搜索输入处理
  const handleSearchInput = (e: any) => {
    setSearchValue(e.detail.value);
  };

  // 标签点击处理
  const handleTagClick = (tag: string) => {
    setActiveTag(tag);
  };

  // 分类卡片点击处理
  const handleCategoryClick = (category: any) => {
    // 根据分类设置对应的标签
    let tag = "全部";
    switch (category.category) {
      case LearningMaterialCategory.GRADUATE_EXAM:
        tag = "考研资料";
        break;
      case LearningMaterialCategory.FINAL_EXAM:
        tag = "期末考试";
        break;
      case LearningMaterialCategory.COURSE_NOTES:
        tag = "课程笔记";
        break;
      case LearningMaterialCategory.LAB_REPORT:
        tag = "实验报告";
        break;
    }
    setActiveTag(tag);
  };

  // 学习资料项点击处理
  const handleMaterialClick = (material: LearningMaterial) => {
    // 显示资料详情和操作选项
    const actions: string[] = [];
    
    if (material.fileUrl) {
      actions.push('下载文件');
    }
    
    if (material.netdiskLink) {
      actions.push('复制网盘链接');
    }
    
    actions.push('查看详情');
    actions.push('取消');

    Taro.showActionSheet({
      itemList: actions,
      success: (res) => {
        const selectedAction = actions[res.tapIndex];
        
        switch (selectedAction) {
          case '下载文件':
            handleDownloadFile(material);
            break;
          case '复制网盘链接':
            handleCopyNetdiskLink(material);
            break;
          case '查看详情':
            handleShowDetails(material);
            break;
        }
      }
    });
  };

  // 下载文件处理
  const handleDownloadFile = (material: LearningMaterial) => {
    if (!material.fileUrl) {
      Taro.showToast({
        title: '文件URL不存在',
        icon: 'none'
      });
      return;
    }

    Taro.showModal({
      title: '下载文件',
      content: `确定要下载文件"${material.title}"吗？`,
      confirmText: '下载',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 显示下载提示
          Taro.showLoading({
            title: '准备下载...'
          });

          // 尝试下载文件
          Taro.downloadFile({
            url: material.fileUrl!,
            success: (downloadRes) => {
              Taro.hideLoading();
              
              // 尝试打开文件
              Taro.openDocument({
                filePath: downloadRes.tempFilePath,
                showMenu: true,
                success: () => {
                  Taro.showToast({
                    title: '文件已打开',
                    icon: 'success'
                  });
                },
                fail: () => {
                  Taro.showToast({
                    title: '无法打开文件',
                    icon: 'none'
                  });
                }
              });
            },
            fail: (error) => {
              Taro.hideLoading();
              
              // 检查是否是域名限制错误
              if (error.errMsg && error.errMsg.includes('domain list')) {
                Taro.showModal({
                  title: '下载限制',
                  content: '由于域名限制，无法直接下载此文件。请复制文件链接在浏览器中打开。',
                  confirmText: '复制链接',
                  cancelText: '取消',
                  success: (modalRes) => {
                    if (modalRes.confirm) {
                      Taro.setClipboardData({
                        data: material.fileUrl!,
                        success: () => {
                          Taro.showToast({
                            title: '链接已复制',
                            icon: 'success'
                          });
                        }
                      });
                    }
                  }
                });
              } else {
                Taro.showToast({
                  title: '下载失败',
                  icon: 'none'
                });
              }
            }
          });
        }
      }
    });
  };

  // 复制网盘链接处理
  const handleCopyNetdiskLink = (material: LearningMaterial) => {
    if (!material.netdiskLink) {
      Taro.showToast({
        title: '网盘链接不存在',
        icon: 'none'
      });
      return;
    }

    Taro.setClipboardData({
      data: material.netdiskLink,
      success: () => {
        Taro.showToast({
          title: '网盘链接已复制',
          icon: 'success'
        });
      },
      fail: () => {
        Taro.showToast({
          title: '复制失败',
          icon: 'none'
        });
      }
    });
  };

  // 显示详情处理
  const handleShowDetails = (material: LearningMaterial) => {
    const details = [
      `标题：${material.title}`,
      `描述：${material.description || '无'}`,
      `学院：${material.college || '无'}`,
      `学科：${material.subject || '无'}`,
      `分类：${CATEGORY_CONFIG[material.category].title}`,
      `文件大小：${formatFileSize(material.fileSize)}`,
      `上传时间：${formatTime(material.uploadTime)}`,
    ];

    if (material.originalFileName) {
      details.push(`原文件名：${material.originalFileName}`);
    }

    Taro.showModal({
      title: '资料详情',
      content: details.join('\n'),
      showCancel: false,
      confirmText: '知道了'
    });
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes || bytes === 0) return '未知大小';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // 格式化时间
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <View className={styles.learningMaterialsPage}>
      {/* 导航栏 */}
      <View className={styles.navbar}>
        <View className={styles.backButton} onClick={handleBack}>
          <Image src={require("@/assets/arrow-left.svg")} className={styles.backIcon} />
        </View>
        <Text className={styles.title}>学习资料</Text>
      </View>

      {/* 搜索框 */}
      <View className={styles.searchContainer}>
        <Input
          type='text'
          placeholder='RAG搜索资料、课程'
          className={styles.searchInput}
          value={searchValue}
          onInput={handleSearchInput}
        />
        <Image src={require("@/assets/search.svg")} className={styles.searchIcon} />
      </View>

      {/* 内容区域 */}
      <ScrollView scrollY className={styles.contentScrollView}>
        {/* 标签栏 */}
        <ScrollView scrollX className={styles.tagsContainer}>
          <View className={styles.tagsWrapper}>
            {tags.map((tag) => (
              <View
                key={tag}
                className={`${styles.tag} ${activeTag === tag ? styles.activeTag : ''}`}
                onClick={() => handleTagClick(tag)}
              >
                <Text className={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* 分类卡片区域 */}
        <View className={styles.categoriesContainer}>
          {categories.map((category) => (
            <View
              key={category.id}
              className={styles.categoryCard}
              onClick={() => handleCategoryClick(category)}
            >
              <Text className={styles.cardIcon}>{category.icon}</Text>
              <Text className={styles.cardTitle}>{category.title}</Text>
              <Text className={styles.cardCount}>{category.count}</Text>
            </View>
          ))}
        </View>

        {/* 最新上传 */}
        <View className={styles.latestUploads}>
          <Text className={styles.sectionTitle}>最新上传</Text>
          {materials.length === 0 ? (
            <View className={styles.emptyState}>
              <Text className={styles.emptyText}>暂无资料，快去上传吧！</Text>
            </View>
          ) : (
            materials.slice(0, 5).map((material) => (
              <View
                key={material.id}
                className={styles.uploadItem}
                onClick={() => handleMaterialClick(material)}
              >
                <Text className={styles.itemIcon}>
                  {CATEGORY_CONFIG[material.category].icon}
                </Text>
                <View className={styles.itemInfo}>
                  <Text className={styles.itemTitle}>{material.title}</Text>
                  <View className={styles.itemMeta}>
                    <Text className={styles.itemSize}>
                      大小：{formatFileSize(material.fileSize)}
                    </Text>
                    <Text className={styles.itemTime}>
                      上传时间：{formatTime(material.uploadTime)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* 带鉴权的悬浮发布按钮 */}
      <AuthFloatingButton
        variant='plus'
        onClick={() => Taro.navigateTo({ url: '/pages/subpackage-discover/upload-material/index' })}
        loginPrompt='您需要登录后才能上传学习资料，是否立即前往登录页面？'
        redirectUrl='/pages/subpackage-discover/upload-material/index'
      />
    </View>
  );
}