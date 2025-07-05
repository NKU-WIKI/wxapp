import { View, Text, Image, Input, Textarea, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import styles from './index.module.scss';
import backIcon from '../../assets/back.png';
import cameraIcon from '../../assets/camera.png';
import arrowRightIcon from '../../assets/arrow-right.png';

const mockProfile = {
  avatar: "https://picsum.photos/id/1025/200/200",
  nickname: "陈小明",
  birthday: "1995-08-16",
  wechat: "xiaoming_95",
  qq: "12345678",
  bio: "热爱生活，享受工作。喜欢摄影、旅行和美食，希望能在这里认识更多志同道合的朋友。目前在一家科技公司担任产品经理，对新技术和创新充满热情。",
};

const EditProfile = () => {
  const [headerPaddingTop, setHeaderPaddingTop] = useState(20);
  const [profile, setProfile] = useState(mockProfile);
  const [nickname, setNickname] = useState(profile.nickname);
  const [birthday, setBirthday] = useState(profile.birthday);
  const [wechatId, setWechatId] = useState(profile.wechat);
  const [qq, setQq] = useState(profile.qq);
  const [bio, setBio] = useState(profile.bio);
  const [statusBarHeight, setStatusBarHeight] = useState(20);

  useEffect(() => {
    const getStatusBarHeight = async () => {
      const res = await Taro.getSystemInfoAsync();
      setStatusBarHeight(res.statusBarHeight || 0);
    };
    getStatusBarHeight();
  }, []);

  useEffect(() => {
    setProfile({ ...profile, nickname, birthday, wechat: wechatId, qq, bio });
  }, [nickname, birthday, wechatId, qq, bio]);

  const handleDateChange = e => {
    setBirthday(e.detail.value);
  };

  const formatBirthday = (dateStr) => {
    if (!dateStr) return '请选择';
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <View className={styles.page}>
      <View
        className={styles.pageHeader}
        style={{ paddingTop: `${headerPaddingTop}px` }}
      >
        <Image src={backIcon} className={styles.backIcon} />
        <Text className={styles.pageTitle}>编辑资料</Text>
        <Text className={styles.saveButton}>保存</Text>
      </View>

      <View className={styles.content}>
        <View className={styles.avatarSection}>
          <View className={styles.avatarWrapper}>
            <Image src={profile.avatar} className={styles.avatar} />
            <View className={styles.cameraIconWrapper}>
              <Image src={cameraIcon} className={styles.cameraIcon} />
            </View>
          </View>
          <Text className={styles.avatarText}>点击更换头像</Text>
        </View>

        <View className={styles.formContainer}>
          <View className={styles.sectionTitle}>基本信息</View>
          <View className={styles.formCard}>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>昵称</Text>
              <Input
                className={styles.formInput}
                name='nickname'
                type='text'
                placeholder='请输入昵称'
                value={nickname}
                onInput={(e) => setNickname(e.detail.value)}
              />
            </View>
            <Picker mode='date' value={birthday} onChange={handleDateChange}>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>生日</Text>
                <View className={styles.pickerValue}>
                  <Text>{formatBirthday(birthday)}</Text>
                  <Image className={styles.arrowIcon} src={arrowRightIcon} />
                </View>
              </View>
            </Picker>
          </View>

          <View className={styles.sectionTitle}>社交账号</View>
          <View className={styles.formCard}>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>微信号</Text>
              <Input
                className={styles.formInput}
                name='wechatId'
                type='text'
                placeholder='请输入微信号'
                value={wechatId}
                onInput={(e) => setWechatId(e.detail.value)}
              />
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>QQ号</Text>
              <Input
                className={styles.formInput}
                name='qq'
                type='text'
                placeholder='请输入QQ号'
                value={qq}
                onInput={(e) => setQq(e.detail.value)}
              />
            </View>
          </View>

          <View className={styles.sectionTitle}>个人简介</View>
          <View className={styles.textareaWrapper}>
            <Textarea
              className={styles.bioTextarea}
              value={bio}
              onInput={(e) => setBio(e.detail.value)}
              maxlength={200}
              placeholder='填写你的简介...'
            />
            <Text className={styles.charCount}>{bio.length}/200</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default EditProfile; 