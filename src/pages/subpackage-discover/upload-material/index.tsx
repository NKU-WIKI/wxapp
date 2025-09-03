import { View, Text, Image, Input, Textarea, Picker, RadioGroup, Radio, Label, Button } from "@tarojs/components";
import { FileUploadRead, MAX_FILE_SIZE, getFileTypeDisplayName } from "@/types/api/fileUpload";
import fileUploadApi from "@/services/api/fileUpload";
import uploadApi from "@/services/api/upload";
import Taro from "@tarojs/taro";
import { useState, useEffect } from "react";
import styles from "./index.module.scss";

// eslint-disable-next-line import/no-unused-modules
export default function UploadMaterial() {
  const [netdiskLink, setNetdiskLink] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [signatureType, setSignatureType] = useState("anonymous");
  const [uploadedFile, setUploadedFile] = useState<FileUploadRead | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<any>(null); // 本地选择的文件
  const [qrCodeImage, setQrCodeImage] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  // 组件卸载时清理 loading 状态
  useEffect(() => {
    return () => {
      if (isUploading) {
        try {
          Taro.hideLoading();
        } catch (e) {
          // 忽略错误
        }
      }
    };
  }, [isUploading]);

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

  // 格式化文件名显示
  const formatFileName = (fileName: string): string => {
    if (!fileName) return '';
    
    // 如果文件名太长，截断中间部分
    if (fileName.length > 30) {
      const extension = fileName.split('.').pop();
      const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
      
      if (nameWithoutExt.length > 20) {
        return `${nameWithoutExt.substring(0, 15)}...${nameWithoutExt.substring(nameWithoutExt.length - 5)}.${extension}`;
      }
    }
    
    return fileName;
  };

  // 返回上一页
  const handleBack = () => {
    Taro.navigateBack();
  };

  // 检查文件大小
  const validateFile = (fileSize: number, fileName: string): boolean => {
    // 检查文件大小 (100MB)
    if (fileSize > MAX_FILE_SIZE) {
      Taro.showToast({
        title: `文件大小不能超过${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB`,
        icon: 'none'
      });
      return false;
    }

    // 基本文件名检查
    if (!fileName || fileName.trim() === '') {
      Taro.showToast({
        title: '文件名无效',
        icon: 'none'
      });
      return false;
    }

    return true;
  };

  // 选择文件
  const handleSelectFile = () => {
    // 检查登录状态
    const token = Taro.getStorageSync("token");
    if (!token) {
      Taro.showModal({
        title: '需要登录',
        content: '文件上传功能需要先登录，是否前往登录？',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({
              url: '/pages/login/index'
            });
          }
        }
      });
      return;
    }

    Taro.chooseMessageFile({
      count: 1,
      type: 'file',
      success: async (res) => {
        const file = res.tempFiles[0];
        
        // 验证文件
        if (!validateFile(file.size, file.name)) {
          return;
        }
        
        // 只保存文件信息，不立即上传
        setSelectedFile(file);
        setOriginalFileName(file.name);
        
        Taro.showToast({
          title: '文件选择成功',
          icon: 'success'
        });
      },
      fail: (_err) => {
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
      success: async (res) => {
        const imagePath = res.tempFilePaths[0];
        
        try {
          // 使用现有的图片上传API
          const imageUrl = await uploadApi.uploadImage(imagePath);
          setQrCodeImage(imageUrl);
          Taro.showToast({
            title: '收款码上传成功',
            icon: 'success'
          });
        } catch (error) {
          Taro.showToast({
            title: error?.message || '收款码上传失败',
            icon: 'none'
          });
        }
      },
      fail: (_err) => {
        Taro.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    });
  };

  // 确认上传
  const handleConfirmUpload = async () => {
    // 验证必填字段
    if (!selectedFile && !netdiskLink.trim()) {
      Taro.showToast({
        title: '请选择文件或填写网盘链接',
        icon: 'none'
      });
      return;
    }

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

    setIsUploading(true);
    
    // 统一的加载状态管理
    Taro.showLoading({
      title: selectedFile ? '正在上传文件...' : '正在提交...'
    });

    try {
      let fileUploadResult: any = null;
      
      // 如果有选择文件，先上传文件
      if (selectedFile) {
        fileUploadResult = await fileUploadApi.uploadFileSimple(selectedFile.path);
        
        if (fileUploadResult && fileUploadResult.data) {
          setUploadedFile(fileUploadResult.data as FileUploadRead);
          
          // 更新加载提示
          Taro.hideLoading();
          Taro.showLoading({
            title: '正在提交...'
          });
        } else {
          throw new Error('文件上传失败');
        }
      }

      // 准备提交数据
      const uploadData = {
        file_url: fileUploadResult?.data?.url || '',
        file_name: originalFileName || fileUploadResult?.data?.filename || '',
        original_file_name: originalFileName,
        server_file_name: fileUploadResult?.data?.filename || '',
        netdisk_link: netdiskLink,
        description: description,
        college: selectedCollege,
        subject: selectedSubject,
        signature_type: signatureType,
        qr_code_url: qrCodeImage
      };

      // TODO: 这里后续会调用真正的提交API
      // 临时存储数据用于调试
      Taro.setStorageSync('uploadMaterialData', uploadData);

      // 隐藏加载状态
      Taro.hideLoading();
      
      Taro.showToast({
        title: '上传成功',
        icon: 'success'
      });

      // 延迟返回上一页
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
      
    } catch (error: any) {
      // 确保隐藏加载状态
      try {
        Taro.hideLoading();
      } catch (e) {
        // 忽略 hideLoading 的错误
      }
      
      // 详细的错误信息
      let errorMessage = '上传失败';
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      }
      
      Taro.showModal({
        title: '上传失败',
        content: errorMessage,
        showCancel: false,
        confirmText: '确定'
      });
    } finally {
      setIsUploading(false);
      // 最终确保 loading 状态被清理
      try {
        Taro.hideLoading();
      } catch (e) {
        // 忽略错误
      }
    }
  };

  return (
    <View className={styles.uploadMaterialPage}>
      {/* 顶部导航栏 */}
      <View className={styles.navbar}>
        <View className={styles.backButton} onClick={handleBack}>
          <Image src={require("@/assets/arrow-left.svg")} className={styles.backIcon} />
        </View>
        <Text className={styles.pageTitle}>上传资料</Text>
      </View>

      {/* 文件上传区域 */}
      <View className={styles.fileUploadArea}>
        <View className={styles.uploadPlaceholder}>
          {uploadedFile ? (
            <View className={styles.uploadedFileInfo} onClick={handleSelectFile}>
              <Text className={styles.uploadSuccessIcon}>✓</Text>
              <Text className={styles.uploadedFileName}>
                {formatFileName(originalFileName || uploadedFile.filename)}
              </Text>
              <Text className={styles.uploadedFileSize}>
                {getFileTypeDisplayName(uploadedFile.content_type || '')} - {Math.round(uploadedFile.size / 1024)}KB
              </Text>
              <Text className={styles.reUploadTip}>点击重新上传</Text>
            </View>
          ) : selectedFile ? (
            <View className={styles.selectedFileInfo} onClick={handleSelectFile}>
              <Text className={styles.selectedFileIcon}>📄</Text>
              <Text className={styles.selectedFileName}>
                {formatFileName(selectedFile.name)}
              </Text>
              <Text className={styles.selectedFileSize}>
                {Math.round(selectedFile.size / 1024)}KB - 待上传
              </Text>
              <Text className={styles.reSelectTip}>点击重新选择</Text>
            </View>
          ) : (
            <View className={styles.uploadEmptyState}>
              <Text className={styles.uploadCloudIcon}>☁️</Text>
              <Text className={styles.uploadTip}>点击选择文件</Text>
              <Text className={styles.formatTip}>支持 PDF、Word、PPT 等格式，单个文件不超过 100MB</Text>
              <Button 
                className={styles.selectFileBtn} 
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectFile();
                }}
              >
                选择文件
              </Button>
            </View>
          )}
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
          {qrCodeImage ? (
            <View className={styles.qrUploadedState}>
              <Image src={qrCodeImage} className={styles.qrPreview} />
              <Text className={styles.qrReUploadTip}>点击重新上传</Text>
            </View>
          ) : (
            <View className={styles.qrEmptyState}>
              <Text className={styles.qrIcon}>📷</Text>
              <Text className={styles.qrTip}>支持 JPG、PNG 格式，建议尺寸 300x300px</Text>
            </View>
          )}
        </View>
      </View>

      {/* 确认上传按钮 */}
      <Button 
        className={styles.confirmUploadBtn} 
        onClick={handleConfirmUpload}
        disabled={isUploading}
      >
        {isUploading ? '上传中...' : '确认上传'}
      </Button>
    </View>
  );
}
