import { View, ScrollView, Text, Image, Input } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState } from "react";
import AuthFloatingButton from "@/components/auth-floating-button";
import styles from "./index.module.scss";

interface CategoryCard {
  id: string;
  title: string;
  count: string;
  icon: string;
  type: string; // 添加类型字段用于样式区分
}

interface UploadItem {
  id: string;
  title: string;
  size: string;
  time: string;
  type: string;
  icon: string;
}

// eslint-disable-next-line import/no-unused-modules
export default function LearningMaterials() {
  const [searchValue, setSearchValue] = useState("");
  const [activeTag, setActiveTag] = useState("全部");

  // 标签数据
  const tags = ["全部", "考研资料", "期末考试", "课程笔记", "实验报告"];

  // 分类卡片数据
  const categories: CategoryCard[] = [
    {
      id: "1",
      title: "课程笔记",
      count: "238 份资料",
      icon: "📚", // 使用emoji
      type: "notes"
    },
    {
      id: "2", 
      title: "期末真题",
      count: "156 份资料",
      icon: "📝", // 使用emoji
      type: "exam"
    },
    {
      id: "3",
      title: "电子书",
      count: "426 本书籍", 
      icon: "📖", // 使用emoji
      type: "book"
    },
    {
      id: "4",
      title: "考研资料",
      count: "184 份资料",
      icon: "🎓", // 使用emoji
      type: "graduate"
    }
  ];

  // 最新上传数据
  const latestUploads: UploadItem[] = [
    {
      id: "1",
      title: "数据结构期末复习重点",
      size: "2.8MB",
      time: "2024-01-15",
      type: "PDF",
      icon: "📄" // 使用emoji
    },
    {
      id: "2",
      title: "操作系统实验报告模板", 
      size: "1.5MB",
      time: "2024-01-14",
      type: "Word",
      icon: "📝" // 使用emoji
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
  const handleCategoryClick = (category: CategoryCard) => {
    Taro.showToast({
      title: `点击了${category.title}`,
      icon: 'none'
    });
  };

  // 上传项点击处理
  const handleUploadItemClick = (item: UploadItem) => {
    Taro.showToast({
      title: `点击了${item.title}`,
      icon: 'none'
    });
  };



  return (
    <View className={styles.learningMaterialsPage}>
      {/* 导航栏 */}
      <View className={styles.navbar}>
        <View className={styles.backButton} onClick={handleBack}>
          <Image src={require("../../../assets/arrow-left.svg")} className={styles.backIcon} />
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
        <Image src={require("../../../assets/search.svg")} className={styles.searchIcon} />
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
          {latestUploads.map((item) => (
            <View
              key={item.id}
              className={styles.uploadItem}
              onClick={() => handleUploadItemClick(item)}
            >
              <Text className={styles.itemIcon}>{item.icon}</Text>
              <View className={styles.itemInfo}>
                <Text className={styles.itemTitle}>{item.title}</Text>
                <View className={styles.itemMeta}>
                  <Text className={styles.itemSize}>大小：{item.size}</Text>
                  <Text className={styles.itemTime}>上传时间：{item.time}</Text>
                </View>
              </View>
            </View>
          ))}
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
