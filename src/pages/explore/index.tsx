import { View, ScrollView, Text, Input, Switch, Image } from '@tarojs/components';
import styles from './index.module.scss';
import CustomHeader from '../../components/custom-header';
import { searchScopes, recommendations, wikiSummary, campusHotList } from './mock';

// 导入图标资源
import addIcon from '../../assets/plus.png';
import micIcon from '../../assets/voice.png';
import refreshIcon from '../../assets/refresh.png';

const Explore = () => {
  return (
    <View className={styles.explorePage}>
      <CustomHeader showNotificationIcon />
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <ScrollView scrollY className={styles.scrollView}>
          <View className={styles.contentWrapper}>
            {/* Search Bar */}
            <View className={styles.searchBar}>
              <Image src={addIcon} className={styles.searchIcon} />
              <Input 
                className={styles.searchInput}
                placeholder="@wiki 探索关于南开的一切，或者贡献您的资料"
              />
              <Image src={micIcon} className={styles.micIcon} />
            </View>

            {/* Search Scopes */}
            <View className={styles.scopesGrid}>
              {searchScopes.map(scope => (
                <View key={scope.id} className={styles.scopeItem}>
                  <Text className={styles.scopeLabel}>{scope.label}</Text>
                  <Switch color="#3d82f6" />
                </View>
              ))}
            </View>

            {/* Recommendations */}
            <View className={styles.recommendations}>
              <Text className={styles.sectionTitle}>为您推荐</Text>
              <View className={styles.recCards}>
                {recommendations.map(rec => (
                  <View key={rec.id} className={styles.recCard}>
                    <Text className={styles.recText}>{rec.text}</Text>
                    <View className={styles.recMeta}>
                      <Image src={rec.icon} className={styles.recIcon} />
                      <Text className={styles.recCount}>{rec.questionedBy} 人提问</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Wiki Summary */}
            <View className={styles.card}>
              <View className={styles.cardHeader}>
                <Text className={styles.sectionTitle}>{wikiSummary.title}</Text>
                <Image src={refreshIcon} className={styles.refreshIcon} />
              </View>
              <View className={styles.wikiContent}>
                {wikiSummary.items.map(item => (
                  <View key={item.id} className={styles.wikiItem}>
                    <Text className={styles.wikiItemContent}>
                      {item.id}. {item.type}：{item.content}
                    </Text>
                  </View>
                ))}
                 <View className={styles.wikiSources}>
                  {wikiSummary.items.map(item => (
                    <Text key={item.id} className={styles.wikiSourceItem}>
                      [{item.source.ref}]{item.source.type} {item.source.linkText}
                    </Text>
                  ))}
                </View>
              </View>
            </View>

            {/* Campus Hot List */}
            <View className={styles.card}>
              <View className={styles.cardHeader}>
                <Text className={styles.sectionTitle}>{campusHotList.title}</Text>
                <Text className={styles.seeMore}>查看更多</Text>
              </View>
              <View className={styles.hotList}>
                {campusHotList.items.map(item => (
                  <View key={item.id} className={styles.hotListItem}>
                    <Text className={`${styles.hotListRank} ${styles[`rank${item.rank}`]}`}>{item.rank}</Text>
                    <View className={styles.hotListItemInfo}>
                      <Text className={styles.hotListTitle}>{item.title}</Text>
                      <Text className={styles.hotListDiscussions}>{item.discussions}</Text>
                    </View>
                    <View className={styles.hotTag}>
                      <Text className={styles.hotTagText}>热</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default Explore;
