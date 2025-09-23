export default {
  pages: [
    "pages/home/index",
    "pages/explore/index",
    "pages/discover/index",
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
        "user-agreement/index",
        "privacy-policy/index",
        "settings/index",
        "account-info/index",
        "draft-box/index",
        "collection/index",
        "followers/index",
        "likes/index",
        "received-likes/index",
        "comments/index",
        "user-detail/index",
        "history/index",
        "feedback/index",
        "feedback-list/index",
        "campus-verification/index",
        "my-posts/index",
        "post-detail/index",
      ]
    },
    {
      root: 'pages/subpackage-discover',
      pages: [
        "learning-materials/index",
        "upload-material/index",
        "activity-square/index",
        "activity-detail/index",
        "publish-activity/index",
        "rating/index",
        "rating/detail/index",
        "rating/publish/index",
      ]
    },
    {
      root: 'pages/subpackage-interactive',
      pages: [
        "notification/index",
        "post-detail/index",
        "publish/index",
        "chat/index",
        "note-detail/index",
        "note-publish/note_publish/index",
      ]
    },
    {
      root: "pages/subpackage-commerce",
      name: "commerce",
      pages: [
        "pages/second-hand/home/index",
        "pages/second-hand/publish/index",
        "pages/second-hand/detail/index",
        "pages/errands/home/index",
        "pages/errands/publish/index",
        "pages/errands/detail/index",
        "pages/errands/my-orders/index",
        "pages/errands/my/index"
      ]
    }
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'nku元智wiki',
    navigationBarTextStyle: 'black',
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
  "enableShareAppMessage": true,
  "enableShareTimeline": true
};
