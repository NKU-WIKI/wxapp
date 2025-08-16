/**
 * 获取推荐内容（帖子、用户等）
 * @param params
 * @returns
 */
export const getRecommendations = (params: any) => {
  console.log("getRecommendations called with:", params);
  // 返回模拟数据，避免404错误
  return Promise.resolve({
    code: 0,
    message: "success",
    data: {
      posts: [],
      users: []
    }
  });
};

const recommendApi = {
  getRecommendations,
};

export default recommendApi;