export default defineAppConfig({
  pages: [
    "pages/home/index",
    "pages/explore/index",
    "pages/discover/index",
    "pages/profile/index",
    "pages/notification/index",
    "pages/post-detail/index",
    "pages/publish/index",
    "pages/edit-profile/index",
    "pages/login/index",
    "pages/level/index"
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "WeChat",
    navigationBarTextStyle: "black",
  },
  tabBar: {
    custom: true,
    color: "#9B9B9B",
    selectedColor: "#4F46E5",
    backgroundColor: "#FFFFFF",
    borderStyle: "white",
    list: [
      {
        pagePath: "pages/home/index",
        text: "首页",
      },
      {
        pagePath: "pages/explore/index",
        text: "探索",
      },
      {
        pagePath: "pages/discover/index",
        text: "发现",
      },
      {
        pagePath: "pages/profile/index",
        text: "我的",
      },
    ],
  },
});
