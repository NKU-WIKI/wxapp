import { AppDispatch, RootState } from '@/store';
import { updateUser } from '@/store/slices/userSlice';
import { UpdateUserProfileRequest } from '@/types/api/user';
import userApi from '@/services/api/user';
import { uploadApi } from '@/services/api/upload';
import { normalizeImageUrl } from '@/utils/image';
import CustomHeader from '@/components/custom-header';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Image, Input, Button, ScrollView, Picker } from '@tarojs/components';
import { BaseEventOrig } from '@tarojs/components/types/common';
import { useDispatch, useSelector } from 'react-redux';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

export default function EditProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user);
  const userInfo = user?.user || null;

  const [avatar, setAvatar] = useState('');
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [birthday, setBirthday] = useState('2000-01-01');
  const [school, setSchool] = useState('南开大学');
  const [college, setCollege] = useState('计算机科学与技术学院');
  const [wechatId, setWechatId] = useState('');
  const [qqId, setQqId] = useState('');
  const [phone, setPhone] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 验证昵称长度（限制为9个字符）
  const validateNicknameLength = (str: string) => {
    return str.length <= 9;
  };

  // 处理昵称输入变化
  const handleNicknameChange = (e: { detail: { value: string } }) => {
    const value = e.detail.value;
    if (validateNicknameLength(value)) {
      setNickname(value);
    }
  };

  // 处理手机号输入变化
  const handlePhoneChange = (e: { detail: { value: string } }) => {
    const value = e.detail.value;
    setPhone(value);
  };

  // 处理微信号输入变化
  const handleWechatIdChange = (e: { detail: { value: string } }) => {
    const value = e.detail.value;
    setWechatId(value);
  };

  // 处理QQ号输入变化
  const handleQqIdChange = (e: { detail: { value: string } }) => {
    const value = e.detail.value;
    setQqId(value);
  };

  // 验证函数
  const validateInputs = () => {
    const errors: string[] = [];

    // 验证昵称
    if (!nickname.trim()) {
      errors.push('• 昵称不能为空');
    } else if (!validateNicknameLength(nickname)) {
      errors.push('• 昵称长度不能超过9个字符');
    }

    // 验证手机号（如果填写了）
    if (phone.trim() && !/^1[3-9]\d{9}$/.test(phone.trim())) {
      errors.push('• 手机号格式不正确');
      errors.push('  应为：11位数字，以1开头');
    }

    // 验证微信号（如果填写了）
    if (wechatId.trim() && !/^[a-zA-Z][a-zA-Z0-9_-]{5,19}$/.test(wechatId.trim())) {
      errors.push('• 微信号格式不正确');
      errors.push('  应为：6-20字符，字母开头，允许字母、数字、下划线、减号');
    }

    // 验证QQ号（如果填写了）
    if (qqId.trim() && !/^\d{5,10}$/.test(qqId.trim())) {
      errors.push('• QQ号格式不正确');
      errors.push('  应为：5-10位数字');
    }

    // 验证生日格式
    if (birthday && !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
      errors.push('• 生日格式不正确');
      errors.push('  应为：YYYY-MM-DD 格式');
    }

    // 如果有错误，显示所有错误信息
    if (errors.length > 0) {
      const errorMessage = errors.join('\n\n');
      Taro.showModal({
        title: '请检查以下信息',
        content: errorMessage,
        showCancel: false,
        confirmText: '知道了',
        confirmColor: '#576b95',
      });
      return false;
    }

    return true;
  };

  // 学院和专业数据
  const collegesAndMajors: Record<string, { name: string; majors: string[] }> = useMemo(
    () => ({
      literature: {
        name: '文学院',
        majors: [
          '汉语言文学',
          '编辑出版学',
          '广播电视学',
          '艺术设计学',
          '绘画',
          '中国画',
          '视觉传达设计',
          '环境设计',
        ],
      },
      history: {
        name: '历史学院',
        majors: ['历史学', '世界史', '考古学', '文物与博物馆学'],
      },
      philosophy: {
        name: '哲学院',
        majors: ['哲学', '逻辑学', '宗教学'],
      },
      foreignLanguage: {
        name: '外国语学院',
        majors: [
          '英语',
          '日语',
          '俄语',
          '法语',
          '德语',
          '翻译',
          '西班牙语',
          '葡萄牙语',
          '意大利语',
          '阿拉伯语',
        ],
      },
      law: {
        name: '法学院',
        majors: ['法学'],
      },
      government: {
        name: '周恩来政府管理学院',
        majors: ['政治学与行政学', '国际政治', '行政管理', '社会学', '社会工作', '应用心理学'],
      },
      marxism: {
        name: '马克思主义学院',
        majors: ['马克思主义理论', '思想政治教育', '科学社会主义', '中国共产党历史'],
      },
      chineseLanguage: {
        name: '汉语言文化学院',
        majors: ['汉语言', '汉语国际教育'],
      },
      economics: {
        name: '经济学院',
        majors: ['经济学', '国际经济与贸易', '财政学', '金融学', '保险学', '金融工程'],
      },
      business: {
        name: '商学院',
        majors: [
          '工商管理',
          '会计学',
          '国际会计',
          '旅游管理',
          '市场营销',
          '财务管理',
          '人力资源管理',
          '信息管理与信息系统',
          '电子商务',
          '图书馆学',
          '档案学',
        ],
      },
      tourism: {
        name: '旅游与服务学院',
        majors: ['旅游管理', '会展经济与管理'],
      },
      finance: {
        name: '金融学院',
        majors: ['金融学', '金融工程', '投资学', '保险学'],
      },
      math: {
        name: '数学科学学院',
        majors: ['数学与应用数学', '信息与计算科学', '统计学', '数据科学与大数据技术'],
      },
      physics: {
        name: '物理科学学院',
        majors: ['物理学', '应用物理学', '光电信息科学与工程', '生物物理'],
      },
      chemistry: {
        name: '化学学院',
        majors: ['化学', '应用化学', '化学生物学', '分子科学与工程'],
      },
      lifescience: {
        name: '生命科学学院',
        majors: ['生物科学', '生物技术', '生物信息学'],
      },
      environment: {
        name: '环境科学与工程学院',
        majors: ['环境科学', '环境工程', '资源循环科学与工程', '生态学'],
      },
      medicine: {
        name: '医学院',
        majors: ['临床医学', '口腔医学', '眼视光医学', '智能医学工程'],
      },
      pharmacy: {
        name: '药学院',
        majors: ['药学', '药物化学', '药剂学', '生药学'],
      },
      electronic: {
        name: '电子信息与光学工程学院',
        majors: [
          '电子信息工程',
          '电子科学与技术',
          '通信工程',
          '微电子科学与工程',
          '光电信息科学与工程',
        ],
      },
      materials: {
        name: '材料科学与工程学院',
        majors: ['材料物理', '材料化学', '材料科学与工程', '新能源材料与器件'],
      },
      computer: {
        name: '计算机学院',
        majors: ['计算机科学与技术'],
      },
      cybersecurity: {
        name: '网络空间安全学院',
        majors: ['网络空间安全', '信息安全', '物联网工程'],
      },
      ai: {
        name: '人工智能学院',
        majors: ['智能科学与技术', '自动化', '机器人工程'],
      },
      software: {
        name: '软件学院',
        majors: ['软件工程'],
      },
      statistics: {
        name: '统计与数据科学学院',
        majors: ['统计学', '应用统计学', '数据科学与大数据技术'],
      },
      journalism: {
        name: '新闻与传播学院',
        majors: ['新闻学', '传播学', '广告学', '网络与新媒体'],
      },
      sociology: {
        name: '社会学院',
        majors: ['社会学', '社会工作', '人类学'],
      },
    }),
    [],
  );

  // 学院选项
  const colleges = [
    { value: '', name: '请选择学院' },
    ...Object.entries(collegesAndMajors).map(([value, info]) => ({
      value,
      name: info.name,
    })),
  ];

  // 根据选择的学院获取专业选项
  const getSubjectsForCollege = (collegeValue: string) => {
    if (!collegeValue || !collegesAndMajors[collegeValue]) {
      return [{ value: '', name: '请先选择学院' }];
    }

    const majors = collegesAndMajors[collegeValue].majors;
    return [
      { value: '', name: '请选择专业' },
      ...majors.map((major) => ({ value: major, name: major })),
    ];
  };

  // 选择器相关状态
  const [selectedCollegeKey, setSelectedCollegeKey] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');

  // 处理学院选择变化
  const handleCollegeChange = (e: BaseEventOrig<{ value: string | number }>) => {
    const index = typeof e.detail.value === 'number' ? e.detail.value : parseInt(e.detail.value);
    const selectedCollegeValue = colleges[index].value;
    setSelectedCollegeKey(selectedCollegeValue);

    // 更新学院字段显示名称
    if (selectedCollegeValue && collegesAndMajors[selectedCollegeValue]) {
      setCollege(collegesAndMajors[selectedCollegeValue].name);
    } else {
      setCollege('');
    }

    // 当学院改变时，清空已选择的专业
    setSelectedMajor('');
  };

  // 处理专业选择变化
  const handleMajorChange = (e: BaseEventOrig<{ value: string | number }>) => {
    const index = typeof e.detail.value === 'number' ? e.detail.value : parseInt(e.detail.value);
    const majors = getSubjectsForCollege(selectedCollegeKey);
    const selectedMajorValue = majors[index].value;
    setSelectedMajor(selectedMajorValue);

    // 更新学院字段为 "学院名称 - 专业名称"
    if (selectedCollegeKey && collegesAndMajors[selectedCollegeKey] && selectedMajorValue) {
      const collegeName = collegesAndMajors[selectedCollegeKey].name;
      setCollege(`${collegeName} - ${selectedMajorValue}`);
    }
  };

  // 根据当前学院信息反推选择器状态
  const initializeCollegeSelection = useCallback(
    (collegeInfo: string) => {
      if (!collegeInfo) return;

      // 检查是否包含 " - " 分隔符（表示有专业信息）
      const parts = collegeInfo.split(' - ');
      const collegeName = parts[0];
      const majorName = parts[1] || '';

      // 查找匹配的学院key
      const collegeEntry = Object.entries(collegesAndMajors).find(
        ([_, info]) => info.name === collegeName,
      );

      if (collegeEntry) {
        const [collegeKey, collegeData] = collegeEntry;
        setSelectedCollegeKey(collegeKey);

        // 如果有专业信息，设置专业
        if (majorName && collegeData.majors.includes(majorName)) {
          setSelectedMajor(majorName);
        }
      }
    },
    [collegesAndMajors],
  );

  // 从服务器加载用户资料
  const loadUserProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await userApi.getMeProfile();
      const profile = response.data;

      if (profile) {
        setAvatar(profile.avatar || '');
        setNickname(profile.nickname || '');
        setBio(profile.bio || '');
        // 使用User接口中定义的字段
        setBirthday(profile.birthday || '');
        setSchool(profile.school || '');
        const collegeInfo = profile.college || '';
        setCollege(collegeInfo);

        // 初始化学院和专业选择器状态
        initializeCollegeSelection(collegeInfo);

        setWechatId(profile.wechat_id || '');
        setQqId(profile.qq_id || '');
        setPhone(profile.phone || '');
      }
    } catch {
      Taro.showToast({ title: '加载资料失败', icon: 'none' });
      // 如果加载失败，使用本地用户信息作为备选
      if (userInfo) {
        setAvatar(userInfo.avatar || '');
        setNickname(userInfo.nickname || '');
        setBio(userInfo.bio || '');
      }
    } finally {
      setIsLoading(false);
    }
  }, [userInfo, initializeCollegeSelection]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  // 如果用户信息为空且不是从服务器加载的，使用本地信息
  useEffect(() => {
    if (!isLoading && userInfo && !avatar && !nickname) {
      setAvatar(userInfo.avatar || '');
      setNickname(userInfo.nickname || '');
      setBio(userInfo.bio || '');
    }
  }, [userInfo, isLoading, avatar, nickname]);

  const handleChooseAvatar = () => {
    if (isUploading) {
      Taro.showToast({ title: '正在上传中，请稍候', icon: 'none' });
      return;
    }

    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFilePath = res.tempFilePaths[0];
        setAvatar(tempFilePath);
        setIsUploading(true);
        Taro.showLoading({ title: '上传中...' });

        try {
          const uploadedUrl = await uploadApi.uploadImage(tempFilePath);
          setAvatar(uploadedUrl);
          Taro.showToast({ title: '头像上传成功', icon: 'success' });
        } catch {
          Taro.showToast({ title: '头像上传失败', icon: 'none' });
          setAvatar(userInfo?.avatar || '');
        } finally {
          setIsUploading(false);
          Taro.hideLoading();
        }
      },
      fail: (error) => {
        if (error.errMsg && !error.errMsg.includes('cancel')) {
          Taro.showToast({ title: '选择图片失败', icon: 'none' });
        }
      },
      complete: () => {
        // 确保在所有情况下都隐藏加载提示
        if (Taro.hideLoading) {
          Taro.hideLoading();
        }
      },
    });
  };

  const handleSave = async () => {
    if (isUploading) {
      Taro.showToast({ title: '正在上传头像...', icon: 'none' });
      return;
    }

    // 使用统一的验证函数
    if (!validateInputs()) {
      return;
    }

    try {
      setIsSaving(true);

      const profileData: UpdateUserProfileRequest & {
        birthday?: string;
        school?: string;
        college?: string;
      } = {
        avatar,
        nickname: nickname.trim(),
        bio: bio.trim(),
        birthday: birthday.trim(),
        school: school.trim(),
        college: college.trim(),
        wechat_id: wechatId.trim(),
        qq_id: qqId.trim(),
        phone: phone.trim(),
      };

      await userApi.updateMeProfile(profileData);

      // 更新Redux store中的用户信息
      const updateData: UpdateUserProfileRequest = {
        nickname: nickname.trim(),
        bio: bio.trim(),
        avatar,
      };
      await dispatch(updateUser(updateData)).unwrap();

      Taro.showToast({ title: '保存成功', icon: 'success' });

      // 延迟返回上一页，让用户看到成功提示
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    } catch {
      Taro.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      setIsSaving(false);
    }
  };

  // 处理生日输入
  const handleBirthdayInput = (e: { detail: { value: string } }) => {
    const value = e.detail.value;
    setBirthday(value);

    // 简单的日期格式验证
    if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      // 这里不显示错误，只在保存时验证
    }
  };

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <View style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <CustomHeader title='编辑资料' />
        <View
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <CustomHeader title='编辑资料' />
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <ScrollView scrollY style={{ height: '100%' }} enhanced showScrollbar={false}>
          <View className={styles.content}>
            {/* 头像部分 */}
            <View className={styles.avatarSection}>
              <View className={styles.avatarUpload} onClick={handleChooseAvatar}>
                <Image
                  src={
                    normalizeImageUrl(avatar) ||
                    'https://ai-public.mastergo.com/ai/img_res/e5f6df9701ea8cf889b7a90a029d2d29.jpg'
                  }
                  className={styles.avatar}
                  mode='aspectFill'
                />
                {isUploading && (
                  <View className={styles.uploadingOverlay}>
                    <Text className={styles.uploadingText}>上传中...</Text>
                  </View>
                )}
              </View>
              <Text className={styles.avatarTip}>点击更换头像</Text>
            </View>

            {/* 基本信息卡片 */}
            <Text className={styles.sectionTitle}>基本信息</Text>
            <View className={styles.card}>
              <View className={styles.fieldRow}>
                <Text className={styles.fieldLabel}>昵称</Text>
                <View className={styles.fieldInputContainer}>
                  <Input
                    className={styles.fieldInput}
                    value={nickname}
                    placeholder='张雨晨'
                    maxlength={9}
                    onInput={handleNicknameChange}
                  />
                  <Text className={styles.characterCount}>{nickname.length}/9</Text>
                </View>
              </View>

              <View className={styles.fieldRow}>
                <Text className={styles.fieldLabel}>个人简介</Text>
                <Input
                  className={styles.fieldInput}
                  value={bio}
                  onInput={(e) => setBio(e.detail.value)}
                  placeholder='热爱生活，享受每一天'
                />
              </View>

              <View className={styles.fieldRow}>
                <Text className={styles.fieldLabel}>生日</Text>
                <Input
                  className={styles.fieldInputGray}
                  value={birthday}
                  placeholder='2005-01-01'
                  onInput={handleBirthdayInput}
                />
              </View>

              <View className={styles.fieldRow}>
                <Text className={styles.fieldLabel}>学校</Text>
                <Input
                  className={styles.fieldInputGray}
                  value={school}
                  placeholder='南开大学'
                  maxlength={50}
                  onInput={(e) => setSchool(e.detail.value)}
                />
              </View>

              <View className={styles.fieldRow}>
                <Text className={styles.fieldLabel}>学院</Text>
                <Picker
                  mode='selector'
                  range={colleges}
                  rangeKey='name'
                  onChange={handleCollegeChange}
                >
                  <View className={styles.fieldSelect}>
                    <Text className={styles.fieldText}>
                      {selectedCollegeKey
                        ? collegesAndMajors[selectedCollegeKey]?.name
                        : '请选择学院'}
                    </Text>
                    <Text className={styles.selectArrow}>▼</Text>
                  </View>
                </Picker>
              </View>

              <View className={styles.fieldRow}>
                <Text className={styles.fieldLabel}>专业</Text>
                <Picker
                  mode='selector'
                  range={getSubjectsForCollege(selectedCollegeKey)}
                  rangeKey='name'
                  onChange={handleMajorChange}
                >
                  <View className={styles.fieldSelect}>
                    <Text className={styles.fieldText}>{selectedMajor || '请选择专业'}</Text>
                    <Text className={styles.selectArrow}>▼</Text>
                  </View>
                </Picker>
              </View>
            </View>

            {/* 联系方式卡片 */}
            <Text className={styles.sectionTitle}>联系方式</Text>
            <View className={styles.card}>
              <View className={styles.fieldRow}>
                <Text className={styles.fieldLabel}>微信号</Text>
                <Input
                  className={styles.fieldInput}
                  value={wechatId}
                  placeholder='rainyday2023'
                  onInput={handleWechatIdChange}
                />
              </View>

              <View className={styles.fieldRow}>
                <Text className={styles.fieldLabel}>QQ号</Text>
                <Input
                  className={styles.fieldInput}
                  value={qqId}
                  placeholder='98765432'
                  onInput={handleQqIdChange}
                />
              </View>

              <View className={styles.fieldRow}>
                <Text className={styles.fieldLabel}>手机号</Text>
                <Input
                  className={styles.fieldInput}
                  value={phone}
                  placeholder='138****5678'
                  type='number'
                  onInput={handlePhoneChange}
                />
              </View>
            </View>

            {/* 底部保存按钮 */}
            <View className={styles.saveButtonContainer}>
              <Button
                className={styles.saveButton}
                onClick={handleSave}
                disabled={isUploading || isSaving || isLoading}
                loading={isSaving}
              >
                {isSaving ? '保存中...' : '保存修改'}
              </Button>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
