export default {
  pages: [
    "pages/home/index",
    "pages/explore/index",
    "pages/discover/index",
    "pages/discover/publish-activity/index",
    "pages/profile/index",
  ],
  subPackages: [
    {
      root: 'pages/subpackage-profile',
      pages: [
        "edit-profile/index",
        "level/index",
        "about/index",
        "login/index",
        "settings/index",
        "draft-box/index",
        "collection/index",
        "followers/index",
        "likes/index",
        "received-likes/index",
        "comments/index",
        "user-detail/index",
        "history/index",
        "feedback/index",
        "my-posts/index",
      ]
    },
    {
      root: 'pages/subpackage-interactive',
      pages: [
        "notification/index",
        "post-detail/index",
        "publish/index",
        "chat/index"
      ]
    }
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
};
