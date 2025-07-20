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
import bellIcon from '@/assets/bell.svg';
import messageSquareIcon from '@/assets/message-square.svg';
import messageCircleIcon from '@/assets/message-circle.svg';
import userIcon from '@/assets/user.svg';
import fileTextIcon from '@/assets/file-text.svg';
import bookOpenIcon from '@/assets/book-open.svg';
import globeIcon from '@/assets/globe-icon.svg';
import shoppingBagIcon from '@/assets/shopping-bag.svg';
import musicIcon from '@/assets/music.svg';
import refreshIcon from '@/assets/refresh-ccw.svg';
import coinIcon from '@/assets/coin.svg'; // 替换 token.png
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

const recommendations = [
  { icon: placeholderIcon, text: '校园跑步打卡活动规则?', count: 756 },
  { icon: placeholderIcon, text: '如何加入校园社团?', count: 543 }
];

const wikiSummary = {
  title: 'wiki 今日南开热点总结',
  items: [
    '科研突破：化学学院在《自然》发表新型纳米材料研究，相关成果获央视报道[1]。',
    '招生争议：知乎热帖讨论“强基计划面试公平性”，校方官微两小时内回应称“全程录像可复核”，舆情迅速降温[2]。',
  ],
  sources: [
    '[1]微博话题 #南开纳米新材料',
    '[2]知乎问题 “强基计划面试公平性”',
  ]
};

const campusHotList = {
  title: '校园热榜',
  items: [
    { rank: 1, title: '期末考试时间调整通知：12 月 20 日起', discussions: '2.8 万讨论', hot: true },
    { rank: 2, title: '新图书馆开放时间延长至晚上 11 点', discussions: '1.5 万讨论', hot: true },
    { rank: 3, title: '校园跑步打卡活动启动', discussions: '9,826 讨论', hot: true }
  ]
};


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

  const renderDefaultView = () => (
    <ScrollView scrollY className={styles.scrollView}>
      {/* Content Source Navigation */}
      <View className={styles.sourceNav}>
        <ScrollView scrollX showScrollbar={false} className={styles.sourceScrollView}>
          {contentSources.map((source, index) => (
            <View key={index} className={styles.sourceItem}>
              <Image src={source.icon} className={styles.sourceIcon} />
              <Text className={styles.sourceName}>{source.name}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Contribution Section */}
      <View className={styles.contributionSection}>
        <Image src={coinIcon} className={styles.contributionIcon} />
        <Text className={styles.contributionText}>今日你已贡献3条知识，获得1000 token!</Text>
      </View>

      <View className={styles.mainContent}>
        {/* Recommended for You */}
        <View className={styles.recommendations}>
          <Text className={styles.sectionTitle}>为您推荐</Text>
          <View className={styles.recGrid}>
            {recommendations.map((rec, index) => (
              <View key={index} className={styles.recCard}>
                <Image src={rec.icon} className={styles.recIcon} />
                <Text className={styles.recText}>{rec.text}</Text>
                <Text className={styles.recCount}>{rec.count} 人提问</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Wiki Summary */}
        <View className={styles.wikiCard}>
          <View className={styles.cardHeader}>
            <Text className={styles.sectionTitle}>{wikiSummary.title}</Text>
            <Image src={refreshIcon} className={styles.refreshIcon} />
          </View>
          <View className={styles.wikiContent}>
            {wikiSummary.items.map((item, index) => (
              <Text key={index} className={styles.wikiItem}>{index + 1}. {item}</Text>
            ))}
            {wikiSummary.sources.map((source, index) => (
              <Text key={index} className={styles.wikiSource}>{source}</Text>
            ))}
          </View>
        </View>

        {/* Campus Hot List */}
        <View className={styles.hotListCard}>
          <View className={styles.cardHeader}>
            <Text className={styles.sectionTitle}>{campusHotList.title}</Text>
            <Text className={styles.seeMore} onClick={() => console.log('See more')}>查看更多</Text>
          </View>
          <View className={styles.hotList}>
            {campusHotList.items.map((item) => (
              <View key={item.rank} className={styles.hotListItem}>
                <Text className={styles.hotListRank}>{item.rank}</Text>
                <View className={styles.hotListItemInfo}>
                  <Text className={styles.hotListTitle}>{item.title}</Text>
                  <View className={styles.hotListMeta}>
                    <Text className={styles.hotListDiscussions}>{item.discussions}</Text>
                    {item.hot && <Text className={styles.hotTag}>热</Text>}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <View className={styles.explorePage}>
      <CustomHeader title="探索" />
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

        <View style={{ flex: 1, overflow: 'hidden' }}>
          {isSearchActive ? renderSearchSkills() : renderDefaultView()}
        </View>
      </View>
    </View>
  );
}
