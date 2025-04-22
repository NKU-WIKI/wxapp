const textCensor = require('./textCensor');

// 测试用例
const testCases = [
  {
    text: '你是个傻逼',
    desc: '原文命中侮辱词'
  },
  {
    text: 'cao ni ma',
    desc: '拼音命中侮辱词'
  },
  {
    text: '我要台独',
    desc: '原文命中政治词'
  },
  {
    text: 'tai du',
    desc: '拼音命中政治词'
  },
  {
    text: 'hello world',
    desc: '无敏感词'
  },
  // 新增更难的测试用例
  {
    text: '台_独',
    desc: '下划线干扰命中政治词'
  },
  {
    text: '台*独',
    desc: '星号干扰命中政治词'
  },
  {
    text: '台 独',
    desc: '空格干扰命中政治词'
  },
  {
    text: '台　独',
    desc: '全角空格干扰命中政治词'
  },
  {
    text: 't a i d u',
    desc: '拼音分隔命中政治词'
  },
  {
    text: 't*a*i*d*u',
    desc: '拼音星号分隔命中政治词'
  },
  {
    text: '傻*逼',
    desc: '星号干扰命中侮辱词'
  },
  {
    text: '傻_逼',
    desc: '下划线干扰命中侮辱词'
  },
  {
    text: '傻 逼',
    desc: '空格干扰命中侮辱词'
  },
  {
    text: '傻　逼',
    desc: '全角空格干扰命中侮辱词'
  },
  {
    text: 's h a b i',
    desc: '拼音分隔命中侮辱词'
  },
  {
    text: 's*h*a*b*i',
    desc: '拼音星号分隔命中侮辱词'
  },
  {
    text: '傻🤔逼',
    desc: '表情符号干扰命中侮辱词'
  },
  {
    text: 'c*a*o n*i m*a',
    desc: '拼音星号分隔命中侮辱词'
  },
  {
    text: 'c a o n i m a',
    desc: '拼音空格分隔命中侮辱词'
  },
  {
    text: 'c_a_o n_i m_a',
    desc: '拼音下划线分隔命中侮辱词'
  },
  {
    text: 'c　a　o n　i m　a',
    desc: '拼音全角空格分隔命中侮辱词'
  },
  {
    text: '傻瓜子',
    desc: '误判测试-不应命中'
  },
  {
    text: '傻逼瓜子',
    desc: '误判测试-应命中'
  },
  {
    text: '台独分子',
    desc: '命中政治词-词组扩展'
  },
  {
    text: '我要+V',
    desc: '广告变体+V不应报错'
  },
  {
    text: 'VX加我',
    desc: '广告变体VX不应报错'
  },
  {
    text: 'v x',
    desc: '广告变体拼音不应报错'
  },
  {
    text: '法 轮 功',
    desc: '空格干扰命中法轮功'
  },
  {
    text: 'f a l u n g o n g',
    desc: '拼音分隔命中法轮功'
  },
  {
    text: 'falun gong',
    desc: '拼音命中法轮功'
  },
  {
    text: '法*轮*功',
    desc: '星号干扰命中法轮功'
  },
  {
    text: '法_轮_功',
    desc: '下划线干扰命中法轮功'
  },
  {
    text: '法　轮　功',
    desc: '全角空格干扰命中法轮功'
  },
  {
    text: 'f*a*l*u*n*g*o*n*g',
    desc: '拼音星号分隔命中法轮功'
  },
  {
    text: '我要台 独',
    desc: '空格干扰命中政治词-句中'
  },
  {
    text: '我要台_独',
    desc: '下划线干扰命中政治词-句中'
  },
  {
    text: '我要台*独',
    desc: '星号干扰命中政治词-句中'
  },
  {
    text: '我要台　独',
    desc: '全角空格干扰命中政治词-句中'
  },
  {
    text: 't a i d u 分子',
    desc: '拼音分隔命中政治词-词组扩展'
  },
  {
    text: 't*a*i*d*u 分子',
    desc: '拼音星号分隔命中政治词-词组扩展'
  },
  {
    text: '台*独分子',
    desc: '星号干扰命中政治词-词组扩展'
  },
  {
    text: '台_独分子',
    desc: '下划线干扰命中政治词-词组扩展'
  },
  {
    text: '台 独分子',
    desc: '空格干扰命中政治词-词组扩展'
  },
  {
    text: '台　独分子',
    desc: '全角空格干扰命中政治词-词组扩展'
  },
  {
    text: '法轮功',
    desc: '原文命中法轮功'
  },
  {
    text: '傻b',
    desc: '拼音缩写命中侮辱词'
  },
  {
    text: 's b',
    desc: '拼音缩写空格命中侮辱词'
  },
  {
    text: 's*b',
    desc: '拼音缩写星号命中侮辱词'
  },
  {
    text: 's_b',
    desc: '拼音缩写下划线命中侮辱词'
  },
  {
    text: 's　b',
    desc: '拼音缩写全角空格命中侮辱词'
  },
  {
    text: '傻 b',
    desc: '汉字拼音混合命中侮辱词'
  },
  {
    text: '傻*b',
    desc: '汉字拼音混合星号命中侮辱词'
  },
  {
    text: '傻_b',
    desc: '汉字拼音混合下划线命中侮辱词'
  },
  {
    text: '傻　b',
    desc: '汉字拼音混合全角空格命中侮辱词'
  },
  {
    text: '傻b逼',
    desc: '拼音缩写+原文命中侮辱词'
  },
  {
    text: '傻b瓜子',
    desc: '拼音缩写+原文命中侮辱词-词组扩展'
  },
  {
    text: '傻b 独',
    desc: '拼音缩写+原文混合命中'
  },
  {
    text: '傻b台独',
    desc: '拼音缩写+原文混合命中-词组扩展'
  },
  {
    text: '傻b台 独',
    desc: '拼音缩写+原文混合空格命中'
  },
  {
    text: '傻b台_独',
    desc: '拼音缩写+原文混合下划线命中'
  },
  {
    text: '傻b台*独',
    desc: '拼音缩写+原文混合星号命中'
  },
  {
    text: '傻b台　独',
    desc: '拼音缩写+原文混合全角空格命中'
  },
  // 拼音缩写+干扰+汉字混合
  { text: 's*b台 独', desc: '拼音缩写+星号+汉字+空格混合' },
  { text: 't a i d u*', desc: '拼音分隔+星号结尾' },
  { text: '傻b台_独', desc: '拼音缩写+汉字+下划线混合' },
  { text: 's_b台*独', desc: '拼音缩写+下划线+汉字+星号混合' },
  { text: 's　b台独', desc: '拼音缩写+全角空格+汉字混合' },
  { text: 's b台 独', desc: '拼音缩写+空格+汉字+空格混合' },
  { text: '傻b台独', desc: '拼音缩写+汉字混合' },
  { text: '傻b台_独', desc: '拼音缩写+汉字+下划线混合' },
  { text: '傻b台*独', desc: '拼音缩写+汉字+星号混合' },
  { text: '傻b台　独', desc: '拼音缩写+汉字+全角空格混合' },
  { text: '傻b台 独', desc: '拼音缩写+汉字+空格混合' },
  // 广告变体
  { text: 'v信', desc: '广告变体v信' },
  { text: 'v x', desc: '广告变体v x' },
  { text: 'vx', desc: '广告变体vx' },
  { text: 'v*x', desc: '广告变体v* x' },
  { text: 'v_x', desc: '广告变体v_ x' },
  { text: 'v　x', desc: '广告变体v全角x' },
  { text: '+v', desc: '广告变体+v' },
  { text: 'vx号', desc: '广告变体vx号' },
  { text: 'vx加我', desc: '广告变体vx加我' },
  { text: 'vx_加我', desc: '广告变体vx_加我' },
  { text: 'vx*加我', desc: '广告变体vx*加我' },
  { text: 'vx　加我', desc: '广告变体vx全角加我' },
  // 符号/emoji/数字/火星文/同音字/谐音字
  { text: '傻🤔b台独', desc: 'emoji干扰拼音缩写+汉字' },
  { text: '傻b台独4', desc: '拼音缩写+汉字+数字' },
  { text: '傻b台独①', desc: '拼音缩写+汉字+火星文数字' },
  { text: '傻b台独功', desc: '拼音缩写+汉字+同音字' },
  { text: '傻b台独弓', desc: '拼音缩写+汉字+谐音字' },
  { text: 'f4lunk0ng', desc: '数字字母火星文拼音变体' },
  { text: 'falun g0ng', desc: '拼音+数字变体' },
  // 误判边界
  { text: '傻瓜', desc: '误判边界-傻瓜' },
  { text: '台灯', desc: '误判边界-台灯' },
  { text: '法轮', desc: '误判边界-法轮' },
  { text: '功夫', desc: '误判边界-功夫' },
  { text: 'sbk', desc: '误判边界-sbk' },
  { text: 's b k', desc: '误判边界-s b k' },
  { text: 's-b', desc: '误判边界-s-b' },
  { text: 's b 独', desc: '误判边界-s b 独' },
  { text: '台du', desc: '误判边界-台du' },
  { text: 'tai独', desc: '误判边界-tai独' },
  // 极端混合
  { text: '傻b台 独4', desc: '拼音缩写+汉字+空格+数字混合' },
  { text: '傻b台_独①', desc: '拼音缩写+汉字+下划线+火星文数字混合' },
  { text: '傻b台*独功', desc: '拼音缩写+汉字+星号+同音字混合' },
  { text: '傻b台　独弓', desc: '拼音缩写+汉字+全角空格+谐音字混合' },
  { text: '傻b台 独功', desc: '拼音缩写+汉字+空格+同音字混合' },
  { text: '傻b台_独弓', desc: '拼音缩写+汉字+下划线+谐音字混合' },
  { text: '傻b台*独4', desc: '拼音缩写+汉字+星号+数字混合' },
  { text: '傻b台　独①', desc: '拼音缩写+汉字+全角空格+火星文数字混合' },
  { text: '傻b台 独4', desc: '拼音缩写+汉字+空格+数字混合' },
  { text: '傻b台_独4', desc: '拼音缩写+汉字+下划线+数字混合' },
  { text: '傻b台*独4', desc: '拼音缩写+汉字+星号+数字混合' },
  { text: '傻b台　独4', desc: '拼音缩写+汉字+全角空格+数字混合' },
  { text: '傻b台 独①', desc: '拼音缩写+汉字+空格+火星文数字混合' },
  { text: '傻b台_独①', desc: '拼音缩写+汉字+下划线+火星文数字混合' },
  { text: '傻b台*独①', desc: '拼音缩写+汉字+星号+火星文数字混合' },
  { text: '傻b台　独①', desc: '拼音缩写+汉字+全角空格+火星文数字混合' },
];

(async () => {
  let hitCount = 0;
  let missCount = 0;
  const hitCases = [];
  const missCases = [];
  for (const { text, desc } of testCases) {
    const result = await textCensor.check(text);
    console.log(`【${desc}】输入: "${text}"`);
    console.log('检测结果:', JSON.stringify(result, null, 2));
    console.log('-----------------------------');
    if (result.risk) {
      hitCount++;
      hitCases.push(desc);
    } else {
      missCount++;
      missCases.push(desc);
    }
  }
  console.log('========= 测试结果汇总 =========');
  console.log(`总用例数: ${testCases.length}`);
  console.log(`命中敏感词: ${hitCount}`);
  console.log(`未命中: ${missCount}`);
  if (hitCases.length) {
    console.log('命中用例:');
    hitCases.forEach(d => console.log('  -', d));
  }
  if (missCases.length) {
    console.log('未命中用例:');
    missCases.forEach(d => console.log('  -', d));
  }
  console.log('===============================');
})(); 