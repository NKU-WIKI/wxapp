export default defineAppConfig({
  pages: [
    "pages/home/index",
    "pages/explore/index",
    "pages/discover/index",
    "pages/profile/index",
    "pages/notifications/index",
    "pages/post-detail/index",
    "pages/publish/index",
    "pages/edit-profile/index",
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "WeChat",
    navigationBarTextStyle: "black",
  },
  tabBar: {
    color: "#9B9B9B",
    selectedColor: "#4A90E2",
    backgroundColor: "#FFFFFF",
    borderStyle: "white",
    list: [
      {
        pagePath: "pages/home/index",
        text: "首页",
        iconPath: "./assets/home.png",
        selectedIconPath: "./assets/home-active.png",
      },
      {
        pagePath: "pages/explore/index",
        text: "探索",
        iconPath: "./assets/explore.png",
        selectedIconPath: "./assets/explore-active.png",
      },
      {
        pagePath: "pages/discover/index",
        text: "发现",
        iconPath: "./assets/discover.png",
        selectedIconPath: "./assets/discover-active.png",
      },
      {
        pagePath: "pages/profile/index",
        text: "我的",
        iconPath: "./assets/profile.png",
        selectedIconPath: "./assets/profile-active.png",
      },
    ],
  },
});
