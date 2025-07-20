import { useState } from 'react';
import { View, ScrollView, Text, Input, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import CustomHeader from '@/components/custom-header';
import { tabBarSyncManager } from '@/utils/tabBarSync';

// 导入新下载的图标
import plusIcon from '@/assets/plus.png';
import micIcon from '@/assets/mic.svg';
import xIcon from '@/assets/x.svg';
import messageCircleIcon from '@/assets/message-circle.svg';
import userIcon from '@/assets/user.svg';
import fileTextIcon from '@/assets/file-text.svg';
import bookOpenIcon from '@/assets/book-open.svg';
import placeholderIcon from '@/assets/placeholder.jpg';
import douyinIcon from '@/assets/douyin.png';
import wechatIcon from '@/assets/wechat.png';
import websiteIcon from '@/assets/website.png';
import marketIcon from '@/assets/market.png';


const searchSkills = [
  { icon: messageCircleIcon, title: '@wiki', desc: '提问任何南开相关问题', example: '例：@wiki 推荐今晚吃什么' },
  { icon: userIcon, title: '@user', desc: '查看和关注感兴趣的人', example: '例：@user 王老师' },
  { icon: fileTextIcon, title: '@post', desc: '查找帖子，发现校园热点内容', example: '例：@post 校园活动' },
  { icon: bookOpenIcon, title: '@knowledge', desc: '搜索知识库，获取校园资讯', example: '例：@knowledge 选课指南' }
];

const contentSources = [
  { icon: websiteIcon, name: '网站' },
  { icon: wechatIcon, name: '微信' },
  { icon: marketIcon, name: '集市' },
  { icon: douyinIcon, name: '抖音' }
];

// 瀑布流卡片宽高比常量
const CARD_ASPECT_RATIO = 9 / 16;

// 瀑布流内容数据
const masonryContent = [
  {
    id: 1,
    image: 'https://ai-public.mastergo.com/ai/img_res/d0cbe5bd6d77c83d610705d1f432556b.jpg',
    title: '二次选拔流程须知：从报名到录取全攻略'
  },
  {
    id: 2,
    image: 'https://ai-public.mastergo.com/ai/img_res/6f8df3467172225dc952ba2620a2a330.jpg',
    title: '元和西饼新品测评：超人气日式甜点大盘点，这些必须尝一尝'
  },
  {
    id: 3,
    image: 'https://ai-public.mastergo.com/ai/img_res/e3daf5d4e2232f27b4f3f1960f3cf239.jpg',
    title: '校园报修指南：快速解决设施问题'
  },
  {
    id: 4,
    image: 'https://ai-public.mastergo.com/ai/img_res/3acb848f06b240728ef706f18be35343.jpg',
    title: '入团入党全程指导：如何规划你的政治生涯'
  },
  {
    id: 5,
    image: 'https://ai-public.mastergo.com/ai/img_res/495754bdf61726322bde0d1e1447e6e2.jpg',
    title: '学分绩计算方法：你的 GPA 这样算'
  },
  {
    id: 6,
    image: 'https://ai-public.mastergo.com/ai/img_res/85b2f2f9252f9cb2a82544152bda5e16.jpg',
    title: '选修课程推荐：最受欢迎的通识课'
  },
  {
    id: 7,
    image: 'https://p3-flow-imagex-sign.byteimg.com/ocean-cloud-tos/image_skill/d86da060-6c52-476c-a3e8-65042a386baf_1753005104585346708~tplv-a9rns2rl98-web-preview-watermark.png?rk3s=b14c611d&x-expires=1784541104&x-signature=WuwEmccC5psFNDKRIBSkyZd6KYE%3D',
    title: '校园生活指南：新生必看攻略'
  },
  {
    id: 8,
    image: 'https://p9-flow-imagex-sign.byteimg.com/ocean-cloud-tos/image_skill/5ec81d7d-e915-43b9-867e-5257bd24d52d_1753005185674606106~tplv-a9rns2rl98-web-preview-watermark.png?rk3s=b14c611d&x-expires=1784541185&x-signature=CrjXK8zog2M2Ht9Pj8q4MDEdeL4%3D',
    title: '图书馆使用技巧：高效学习方法'
  }
];


export default function ExplorePage() {
  const [isSearchActive, setIsSearchActive] = useState(false);

  const handleNavigate = (url: string) => {
    tabBarSyncManager.navigateToPage(url);
  };

  const renderSearchSkills = () => (
    <View className={styles.searchSkillsContainer}>
      <View className={styles.skillsHeader}>
        <View className={styles.skillsTitleDecorator} />
        <Text className={styles.skillsTitle}>搜索技巧</Text>
      </View>
      <View className={styles.skillsGrid}>
        {searchSkills.map((skill, index) => (
          <View key={index} className={styles.skillCard}>
            <View className={styles.skillIconContainer}>
              <Image src={skill.icon} className={styles.skillIcon} />
            </View>
            <Text className={styles.skillTitle}>{skill.title}</Text>
            <Text className={styles.skillDesc}>{skill.desc}</Text>
            <Text className={styles.skillExample}>{skill.example}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderMasonryLayout = () => {
    // 将内容分为两列
    const leftColumn = masonryContent.filter((_, index) => index % 2 === 0);
    const rightColumn = masonryContent.filter((_, index) => index % 2 === 1);

    return (
      <View className={styles.masonryContainer}>
        <View className={styles.masonryColumn}>
          {leftColumn.map((item, index) => (
            <View key={item.id} className={`${styles.masonryItem} ${index > 0 ? styles.masonryItemOffset : ''}`}>
              <View className={styles.contentCard}>
                <Image 
                  src={item.image} 
                  className={styles.contentImage} 
                  mode="aspectFill"
                  style={{ aspectRatio: CARD_ASPECT_RATIO }}
                />
                <View className={styles.contentInfo}>
                  <Text className={styles.contentTitle}>{item.title}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
        <View className={styles.masonryColumn}>
          {rightColumn.map((item, index) => (
            <View key={item.id} className={`${styles.masonryItem} ${index === 0 ? styles.masonryItemOffsetFirst : ''}`}>
              <View className={styles.contentCard}>
                <Image 
                  src={item.image} 
                  className={styles.contentImage} 
                  mode="aspectFill"
                  style={{ aspectRatio: CARD_ASPECT_RATIO }}
                />
                <View className={styles.contentInfo}>
                  <Text className={styles.contentTitle}>{item.title}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderDefaultView = () => (
    <ScrollView scrollY className={styles.scrollView}>
      {/* Content Source Navigation */}
      <View className={styles.sourceNav}>
        <View className={styles.sourceGrid}>
          {contentSources.map((source, index) => (
            <View key={index} className={styles.sourceItem}>
              <Image src={source.icon} className={styles.sourceIcon} />
              <Text className={styles.sourceName}>{source.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Masonry Layout */}
      <View className={styles.masonryWrapper}>
        {renderMasonryLayout()}
      </View>
    </ScrollView>
  );

  return (
    <View style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
              <CustomHeader title="发现" hideBack={true} showWikiButton={true} showNotificationIcon={true} />
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <ScrollView scrollY style={{ height: '100%' }}>
      <View className={styles.pageContent}>
        <View className={styles.searchBarWrapper}>
          <View className={styles.searchContainer}>
            <Image src={plusIcon} className={styles.searchIcon} />
            <Input
              className={styles.searchInput}
              placeholder="搜索南开的一切"
              onFocus={() => setIsSearchActive(true)}
            />
            {isSearchActive ? (
              <Image
                src={xIcon}
                className={styles.searchIcon}
                onClick={() => setIsSearchActive(false)}
              />
            ) : (
              <Image src={micIcon} className={styles.searchIcon} />
            )}
          </View>
        </View>
          {isSearchActive ? renderSearchSkills() : renderDefaultView()}
        </View>
        </ScrollView>
      </View>
    </View>
  );
}