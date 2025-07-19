import { View, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { FC, useEffect, useState } from "react";
import styles from "./index.module.scss";

// 引入本地图标
import homeIcon from "../assets/home.png";
import homeActiveIcon from "../assets/home-active.png";
import exploreIcon from "../assets/explore.png";
import exploreActiveIcon from "../assets/explore-active.png";
import discoverIcon from "../assets/discover.png";
import discoverActiveIcon from "../assets/discover-active.png";
import profileIcon from "../assets/profile.png";
import profileActiveIcon from "../assets/profile-active.png";
import plusIcon from "../assets/plus.svg";

const CustomTabBar: FC = () => {
  const [selected, setSelected] = useState(0);

  const list = [
    {
      pagePath: "/pages/home/index",
      text: "首页",
      iconPath: homeIcon,
      selectedIconPath: homeActiveIcon,
    },
    {
      pagePath: "/pages/explore/index",
      text: "探索",
      iconPath: exploreIcon,
      selectedIconPath: exploreActiveIcon,
    },
    {
      pagePath: "/pages/publish/index",
      text: "发布",
      iconPath: plusIcon,
      selectedIconPath: plusIcon,
      isPublish: true,
    },
    {
      pagePath: "/pages/discover/index",
      text: "发现",
      iconPath: discoverIcon,
      selectedIconPath: discoverActiveIcon,
    },
    {
      pagePath: "/pages/profile/index",
      text: "我的",
      iconPath: profileIcon,
      selectedIconPath: profileActiveIcon,
    },
  ];

  const switchTab = (index, url) => {
    if (list[index].isPublish) {
      Taro.navigateTo({ url });
    } else {
      setSelected(index);
      Taro.switchTab({ url });
    }
  };

  useEffect(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const currentPath = `/${currentPage.route}`;
    const selectedIndex = list.findIndex(item => item.pagePath === currentPath);
    if (selectedIndex > -1) {
      setSelected(selectedIndex);
    }
  }, []);

  return (
    <View className={styles.tabBar}>
      {list.map((item, index) => (
        <View
          key={index}
          className={styles.tabBarItem}
          onClick={() => switchTab(index, item.pagePath)}
        >
          {item.isPublish ? (
            <View className={styles.publishButton}>
              <Image src={item.iconPath} className={styles.publishIcon} />
            </View>
          ) : (
            <>
              <Image
                src={selected === index ? item.selectedIconPath : item.iconPath}
                className={styles.icon}
              />
              <View
                className={`${styles.text} ${
                  selected === index ? styles.selected : ""
                }`}
              >
                {item.text}
              </View>
            </>
          )}
        </View>
      ))}
    </View>
  );
};

export default CustomTabBar; 