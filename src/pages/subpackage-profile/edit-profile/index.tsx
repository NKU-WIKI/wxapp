import { AppDispatch, RootState } from "@/store";
import { updateUser } from "@/store/slices/userSlice";
import { UpdateUserProfileRequest } from "@/types/api/user";

import { uploadApi } from "@/services/api/upload";
import { normalizeImageUrl } from "@/utils/image";
import CustomHeader from "@/components/custom-header";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Input,
  Button,
  ScrollView,
} from "@tarojs/components";
import { useDispatch, useSelector } from "react-redux";
import Taro from "@tarojs/taro";
import styles from "./index.module.scss";

export default function EditProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user);
  const userInfo = user?.user || null;

  const [avatar, setAvatar] = useState("");
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [birthday, setBirthday] = useState("");
  const [school, setSchool] = useState("");
  const [college, setCollege] = useState("");
  const [wechatId, setWechatId] = useState("");
  const [qqId, setQqId] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (userInfo) {
      setAvatar(userInfo.avatar || "");
      setNickname(userInfo.nickname || "");
      setBio(userInfo.bio || "");
      setBirthday("2000-01-01"); // 默认生日
      setSchool("南开大学"); // 默认学校
      setCollege("计算机科学与技术学院"); // 默认学院
      setWechatId(""); // 默认微信号
      setQqId(""); // 默认QQ号
      setPhone(""); // 默认手机号
      setLocation("中国 北京"); // 默认位置
      setInterests(["运动", "音乐", "摄影", "旅行", "美食", "科技"]); // 默认兴趣标签
    }
  }, [userInfo]);

  const handleChooseAvatar = () => {
    if (isUploading) {
      Taro.showToast({ title: "正在上传中，请稍候", icon: "none" });
      return;
    }

    Taro.chooseImage({
      count: 1,
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: async (res) => {
        const tempFilePath = res.tempFilePaths[0];
        setAvatar(tempFilePath);
        setIsUploading(true);
        Taro.showLoading({ title: "上传中..." });

        try {
          const uploadedUrl = await uploadApi.uploadImage(tempFilePath);
          setAvatar(uploadedUrl);
          Taro.showToast({ title: "头像上传成功", icon: "success" });
        } catch (error) {
          
          Taro.showToast({ title: "头像上传失败", icon: "none" });
          setAvatar(userInfo?.avatar || "");
        } finally {
          setIsUploading(false);
          Taro.hideLoading();
        }
      },
      fail: (error) => {
        
        if (error.errMsg && !error.errMsg.includes("cancel")) {
          Taro.showToast({ title: "选择图片失败", icon: "none" });
        }
      },
      complete: () => {
        // 确保在所有情况下都隐藏加载提示
        if (Taro.hideLoading) {
          Taro.hideLoading();
        }
      }
    });
  };

  const handleSave = async () => {
    if (isUploading) {
      Taro.showToast({ title: "正在上传头像...", icon: "none" });
      return;
    }

    const formData: UpdateUserProfileRequest = {
      nickname,
      bio,
      avatar,
      // 添加兴趣标签
      interest_tags: interests,
    };

    try {
      await dispatch(updateUser(formData)).unwrap();
      Taro.showToast({ title: "保存成功", icon: "success" });
      Taro.navigateBack();
    } catch (error) {
      Taro.showToast({ title: "保存失败", icon: "none" });
    }
  };

  const handleLocationSelect = () => {
    Taro.showToast({ title: "位置选择功能开发中", icon: "none" });
  };

  const handleBirthdaySelect = () => {
    Taro.showToast({ title: "生日选择功能开发中", icon: "none" });
  };

  const handleSchoolSelect = () => {
    Taro.showToast({ title: "学校选择功能开发中", icon: "none" });
  };

  const handleCollegeSelect = () => {
    Taro.showToast({ title: "学院选择功能开发中", icon: "none" });
  };

  const handleInterestToggle = (interest: string) => {
    setInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((item) => item !== interest);
      } else {
        return [...prev, interest];
      }
    });
  };

  const availableInterests = [
    "运动",
    "音乐",
    "摄影",
    "旅行",
    "美食",
    "科技",
    "阅读",
    "电影",
    "游戏",
    "绘画",
  ];

  // 如果用户信息为空，显示加载状态
  if (!userInfo) {
    return (
      <View
        style={{ display: "flex", flexDirection: "column", height: "100vh" }}
      >
        <CustomHeader title='编辑资料' />
        <View style={{ flex: 1, overflow: "hidden" }}>
          <ScrollView 
            scrollY 
            style={{ height: "100%" }}
            enhanced
            showScrollbar={false}
          >
            <View className={styles.content}>
              <Text>加载中...</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <View style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <CustomHeader title='编辑资料' />
      <View style={{ flex: 1, overflow: "hidden" }}>
        <ScrollView 
          scrollY 
          style={{ height: "100%" }}
          enhanced
          showScrollbar={false}
        >
          <View className={styles.content}>
            {/* 头像部分 */}
            <View className={styles.avatarSection}>
              <View
                className={styles.avatarUpload}
                onClick={handleChooseAvatar}
              >
                <Image
                  src={
                    normalizeImageUrl(avatar) ||
                    "https://ai-public.mastergo.com/ai/img_res/e5f6df9701ea8cf889b7a90a029d2d29.jpg"
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
            <View className={styles.card}>
              <Text className={styles.cardTitle}>基本信息</Text>

              <View className={styles.fieldRow}>
                <Text className={styles.fieldLabel}>昵称</Text>
                <Input
                  className={styles.fieldInput}
                  value={nickname}
                  placeholder='张雨晨'
                  onInput={(e) => setNickname(e.detail.value)}
                />
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

              <View className={styles.fieldRow} onClick={handleBirthdaySelect}>
                <Text className={styles.fieldLabel}>生日</Text>
                <View className={styles.fieldValue}>
                  <Text className={styles.fieldText}>
                    {birthday || "2000-01-01"}
                  </Text>
                  <Text className={styles.chevronRight}>›</Text>
                </View>
              </View>

              <View className={styles.fieldRow} onClick={handleSchoolSelect}>
                <Text className={styles.fieldLabel}>学校</Text>
                <View className={styles.fieldValue}>
                  <Text className={styles.fieldText}>
                    {school || "南开大学"}
                  </Text>
                  <Text className={styles.chevronRight}>›</Text>
                </View>
              </View>

              <View className={styles.fieldRow} onClick={handleCollegeSelect}>
                <Text className={styles.fieldLabel}>学院</Text>
                <View className={styles.fieldValue}>
                  <Text className={styles.fieldText}>
                    {college || "计算机科学与技术学院"}
                  </Text>
                  <Text className={styles.chevronRight}>›</Text>
                </View>
              </View>
            </View>

            {/* 兴趣标签卡片 */}
            <View className={styles.card}>
              <Text className={styles.cardTitle}>兴趣标签</Text>
              <View className={styles.interestGrid}>
                {availableInterests.map((interest) => (
                  <View
                    key={interest}
                    className={`${styles.interestTag} ${
                      interests.includes(interest)
                        ? styles.interestTagActive
                        : ""
                    }`}
                    onClick={() => handleInterestToggle(interest)}
                  >
                    <Text
                      className={`${styles.interestText} ${
                        interests.includes(interest)
                          ? styles.interestTextActive
                          : ""
                      }`}
                    >
                      {interest}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 联系方式卡片 */}
            <View className={styles.card}>
              <Text className={styles.cardTitle}>联系方式</Text>

              <View className={styles.fieldRow}>
                <Text className={styles.fieldLabel}>微信号</Text>
                <Input
                  className={styles.fieldInput}
                  value={wechatId}
                  placeholder='rainyday2023'
                  onInput={(e) => setWechatId(e.detail.value)}
                />
              </View>

              <View className={styles.fieldRow}>
                <Text className={styles.fieldLabel}>QQ号</Text>
                <Input
                  className={styles.fieldInput}
                  value={qqId}
                  placeholder='98765432'
                  onInput={(e) => setQqId(e.detail.value)}
                />
              </View>

              <View className={styles.fieldRow}>
                <Text className={styles.fieldLabel}>手机号</Text>
                <Input
                  className={styles.fieldInput}
                  value={phone}
                  placeholder='138****5678'
                  type='number'
                  onInput={(e) => setPhone(e.detail.value)}
                />
              </View>
            </View>

            {/* 位置信息卡片 */}
            <View className={styles.card}>
              <Text className={styles.cardTitle}>位置信息</Text>

              <View className={styles.fieldRow} onClick={handleLocationSelect}>
                <Text className={styles.fieldLabel}>国家/城市</Text>
                <View className={styles.fieldValue}>
                  <Text className={styles.fieldText}>
                    {location || "中国 北京"}
                  </Text>
                  <Text className={styles.chevronRight}>›</Text>
                </View>
              </View>
            </View>

            {/* 底部保存按钮 */}
            <View className={styles.saveButtonContainer}>
              <Button
                className={styles.saveButton}
                onClick={handleSave}
                disabled={isUploading}
              >
                保存修改
              </Button>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
