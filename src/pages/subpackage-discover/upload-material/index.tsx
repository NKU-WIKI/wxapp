import { View, Text, Image, Input, Textarea, Picker, RadioGroup, Radio, Label, Button } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState } from "react";
import styles from "./index.module.scss";

// eslint-disable-next-line import/no-unused-modules
export default function UploadMaterial() {
  const [netdiskLink, setNetdiskLink] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [signatureType, setSignatureType] = useState("anonymous");

  // 学院选项
  const colleges = [
    { value: "", name: "请选择学院" },
    { value: "computer", name: "计算机学院" },
    { value: "math", name: "数学学院" },
    { value: "physics", name: "物理学院" },
    { value: "chemistry", name: "化学学院" },
    { value: "business", name: "商学院" }
  ];

  // 学科选项
  const subjects = [
    { value: "", name: "请选择学科" },
    { value: "cs", name: "计算机科学" },
    { value: "math", name: "数学" },
    { value: "physics", name: "物理" },
    { value: "chemistry", name: "化学" },
    { value: "economics", name: "经济学" }
  ];

  // 返回上一页
  const handleBack = () => {
    Taro.navigateBack();
  };

  // 选择文件
  const handleSelectFile = () => {
    Taro.chooseMessageFile({
      count: 1,
      type: 'file',
      success: (res) => {
        console.log('选择文件成功', res);
        Taro.showToast({
          title: '文件选择成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('选择文件失败', err);
        Taro.showToast({
          title: '文件选择失败',
          icon: 'none'
        });
      }
    });
  };

  // 网盘链接输入
  const handleNetdiskInput = (e: any) => {
    setNetdiskLink(e.detail.value);
  };

  // 资料说明输入
  const handleDescriptionInput = (e: any) => {
    setDescription(e.detail.value);
  };

  // 学院选择
  const handleCollegeChange = (e: any) => {
    const index = e.detail.value;
    setSelectedCollege(colleges[index].value);
  };

  // 学科选择
  const handleSubjectChange = (e: any) => {
    const index = e.detail.value;
    setSelectedSubject(subjects[index].value);
  };

  // 署名方式选择
  const handleSignatureChange = (e: any) => {
    setSignatureType(e.detail.value);
  };

  // 选择收款码图片
  const handleSelectQRCode = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log('选择收款码成功', res);
        Taro.showToast({
          title: '收款码上传成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('选择收款码失败', err);
      }
    });
  };

  // 确认上传
  const handleConfirmUpload = () => {
    if (!description.trim()) {
      Taro.showToast({
        title: '请填写资料说明',
        icon: 'none'
      });
      return;
    }

    if (!selectedCollege) {
      Taro.showToast({
        title: '请选择所属学院',
        icon: 'none'
      });
      return;
    }

    if (!selectedSubject) {
      Taro.showToast({
        title: '请选择学科分类',
        icon: 'none'
      });
      return;
    }

    // 这里处理上传逻辑
    Taro.showToast({
      title: '上传成功',
      icon: 'success'
    });

    // 延迟返回上一页
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  return (
    <View className={styles.uploadMaterialPage}>
      {/* 顶部导航栏 */}
      <View className={styles.navbar}>
        <View className={styles.backButton} onClick={handleBack}>
          <Image src={require("../../../assets/arrow-left.svg")} className={styles.backIcon} />
        </View>
        <Text className={styles.pageTitle}>上传资料</Text>
      </View>

      {/* 文件上传区域 */}
      <View className={styles.fileUploadArea}>
        <View className={styles.uploadPlaceholder} onClick={handleSelectFile}>
          <Text className={styles.uploadCloudIcon}>☁️</Text>
          <Text className={styles.uploadTip}>点击上传或将文件拖拽到这里</Text>
          <Text className={styles.formatTip}>支持 PDF、Word、PPT 等格式，单个文件不超过 100MB</Text>
          <Button className={styles.selectFileBtn} onClick={handleSelectFile}>选择文件</Button>
        </View>
      </View>

      {/* 网盘链接输入 */}
      <View className={styles.formGroup}>
        <Input
          type='text'
          placeholder='请输入资料网盘链接'
          className={styles.netdiskInput}
          value={netdiskLink}
          onInput={handleNetdiskInput}
        />
      </View>

      {/* 资料说明文本域 */}
      <View className={styles.formGroup}>
        <Text className={styles.formLabel}>资料说明</Text>
        <Textarea
          placeholder='请输入资料说明'
          className={styles.descriptionTextarea}
          value={description}
          onInput={handleDescriptionInput}
        />
      </View>

      {/* 所属学院下拉选择 */}
      <View className={styles.formGroup}>
        <Text className={styles.formLabel}>所属学院</Text>
        <Picker
          mode='selector'
          range={colleges}
          rangeKey='name'
          onChange={handleCollegeChange}
        >
          <View className={styles.collegeSelect}>
            <Text className={styles.selectText}>
              {selectedCollege ? colleges.find(c => c.value === selectedCollege)?.name : '请选择学院'}
            </Text>
            <Text className={styles.selectArrow}>▼</Text>
          </View>
        </Picker>
      </View>

      {/* 学科分类下拉选择 */}
      <View className={styles.formGroup}>
        <Text className={styles.formLabel}>学科分类</Text>
        <Picker
          mode='selector'
          range={subjects}
          rangeKey='name'
          onChange={handleSubjectChange}
        >
          <View className={styles.subjectSelect}>
            <Text className={styles.selectText}>
              {selectedSubject ? subjects.find(s => s.value === selectedSubject)?.name : '请选择学科'}
            </Text>
            <Text className={styles.selectArrow}>▼</Text>
          </View>
        </Picker>
      </View>

      {/* 署名方式（单选） */}
      <View className={styles.formGroup}>
        <Text className={styles.formLabel}>署名方式</Text>
        <RadioGroup className={styles.signatureOptions} onChange={handleSignatureChange}>
          <Label className={styles.radioLabel}>
            <Radio value='anonymous' checked={signatureType === 'anonymous'} />
            <Text className={styles.radioText}>匿名</Text>
          </Label>
          <Label className={styles.radioLabel}>
            <Radio value='realname' checked={signatureType === 'realname'} />
            <Text className={styles.radioText}>实名</Text>
          </Label>
        </RadioGroup>
      </View>

      {/* 收款码（选填，上传区域） */}
      <View className={styles.formGroup}>
        <Text className={styles.formLabel}>收款码（选填）</Text>
        <View className={styles.qrUploadArea} onClick={handleSelectQRCode}>
          <Text className={styles.qrIcon}>📷</Text>
          <Text className={styles.qrTip}>支持 JPG、PNG 格式，建议尺寸 300x300px</Text>
        </View>
      </View>

      {/* 确认上传按钮 */}
      <Button className={styles.confirmUploadBtn} onClick={handleConfirmUpload}>
        确认上传
      </Button>
    </View>
  );
}
