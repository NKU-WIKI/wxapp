import { View, Text, Image, Input, Textarea, Picker, RadioGroup, Radio, Label, Button } from "@tarojs/components";
import { FileUploadRead, MAX_FILE_SIZE, getFileTypeDisplayName } from "@/types/api/fileUpload";
import fileUploadApi from "@/services/api/fileUpload";
import uploadApi from "@/services/api/upload";
import { checkFileUploadPermissionWithToast } from "@/utils/permissionChecker";
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

  // 学院和专业数据
  const collegesAndMajors: Record<string, { name: string; majors: string[] }> = {
    literature: {
      name: "文学院",
      majors: ["汉语言文学", "编辑出版学", "广播电视学", "艺术设计学", "绘画", "中国画", "视觉传达设计", "环境设计"]
    },
    history: {
      name: "历史学院", 
      majors: ["历史学", "世界史", "考古学", "文物与博物馆学"]
    },
    philosophy: {
      name: "哲学院",
      majors: ["哲学", "逻辑学", "宗教学"]
    },
    foreignLanguage: {
      name: "外国语学院",
      majors: ["英语", "日语", "俄语", "法语", "德语", "翻译", "西班牙语", "葡萄牙语", "意大利语", "阿拉伯语"]
    },
    law: {
      name: "法学院",
      majors: ["法学"]
    },
    government: {
      name: "周恩来政府管理学院",
      majors: ["政治学与行政学", "国际政治", "行政管理", "社会学", "社会工作", "应用心理学"]
    },
    marxism: {
      name: "马克思主义学院",
      majors: ["马克思主义理论", "思想政治教育", "科学社会主义", "中国共产党历史"]
    },
    chineseLanguage: {
      name: "汉语言文化学院",
      majors: ["汉语言", "汉语国际教育"]
    },
    economics: {
      name: "经济学院",
      majors: ["经济学", "国际经济与贸易", "财政学", "金融学", "保险学", "金融工程"]
    },
    business: {
      name: "商学院",
      majors: ["工商管理", "会计学", "国际会计", "旅游管理", "市场营销", "财务管理", "人力资源管理", "信息管理与信息系统", "电子商务", "图书馆学", "档案学"]
    },
    tourism: {
      name: "旅游与服务学院",
      majors: ["旅游管理", "会展经济与管理"]
    },
    finance: {
      name: "金融学院",
      majors: ["金融学", "金融工程", "投资学", "保险学"]
    },
    math: {
      name: "数学科学学院",
      majors: ["数学与应用数学", "信息与计算科学", "统计学", "数据科学与大数据技术"]
    },
    physics: {
      name: "物理科学学院",
      majors: ["物理学", "应用物理学", "光电信息科学与工程", "生物物理"]
    },
    chemistry: {
      name: "化学学院",
      majors: ["化学", "应用化学", "化学生物学", "分子科学与工程"]
    },
    lifescience: {
      name: "生命科学学院",
      majors: ["生物科学", "生物技术", "生物信息学"]
    },
    environment: {
      name: "环境科学与工程学院",
      majors: ["环境科学", "环境工程", "资源循环科学与工程", "生态学"]
    },
    medicine: {
      name: "医学院",
      majors: ["临床医学", "口腔医学", "眼视光医学", "智能医学工程"]
    },
    pharmacy: {
      name: "药学院",
      majors: ["药学", "药物化学", "药剂学", "生药学"]
    },
    electronic: {
      name: "电子信息与光学工程学院",
      majors: ["电子信息工程", "电子科学与技术", "通信工程", "微电子科学与工程", "光电信息科学与工程"]
    },
    materials: {
      name: "材料科学与工程学院",
      majors: ["材料物理", "材料化学", "材料科学与工程", "新能源材料与器件"]
    },
    computer: {
      name: "计算机学院",
      majors: ["计算机科学与技术"]
    },
    cybersecurity: {
      name: "网络空间安全学院",
      majors: ["网络空间安全", "信息安全","物联网工程"]
    },
    ai: {
      name: "人工智能学院",
      majors: ["智能科学与技术", "自动化", "机器人工程"]
    },
    software: {
      name: "软件学院",
      majors: ["软件工程"]
    },
    statistics: {
      name: "统计与数据科学学院",
      majors: ["统计学", "应用统计学", "数据科学与大数据技术"]
    },
    journalism: {
      name: "新闻与传播学院",
      majors: ["新闻学", "传播学", "广告学", "网络与新媒体"]
    },
    sociology: {
      name: "社会学院",
      majors: ["社会学", "社会工作", "人类学"]
    }
  };

  // 学院选项
  const colleges = [
    { value: "", name: "请选择学院" },
    ...Object.entries(collegesAndMajors).map(([value, info]) => ({
      value,
      name: info.name
    }))
  ];

  // 根据选择的学院获取专业选项
  const getSubjectsForCollege = (collegeValue: string) => {
    if (!collegeValue || !collegesAndMajors[collegeValue]) {
      return [{ value: "", name: "请先选择学院" }];
    }
    
    const majors = collegesAndMajors[collegeValue].majors;
    return [
      { value: "", name: "请选择专业" },
      ...majors.map(major => ({ value: major, name: major }))
    ];
  };

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
    // 检查文件大小 (10MB)
    if (fileSize > MAX_FILE_SIZE) {
      const fileSizeMB = Math.round(fileSize / 1024 / 1024 * 100) / 100; // 保留两位小数
      const maxSizeMB = Math.round(MAX_FILE_SIZE / 1024 / 1024);
      
      Taro.showModal({
        title: '文件过大',
        content: `当前文件大小：${fileSizeMB}MB\n最大支持：${maxSizeMB}MB\n\n请选择更小的文件或压缩后重试`,
        showCancel: false,
        confirmText: '确定'
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
    // 检查文件上传权限
    if (!checkFileUploadPermissionWithToast()) {
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
      fail: (err) => {
        // 用户取消选择是正常行为，不需要显示错误提示
        if (err.errMsg && err.errMsg.includes('cancel')) {
          return;
        }
        // 只有真正的错误才显示提示
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
    const selectedCollegeValue = colleges[index].value;
    setSelectedCollege(selectedCollegeValue);
    
    // 当学院改变时，清空已选择的学科
    setSelectedSubject("");
  };

  // 学科选择
  const handleSubjectChange = (e: any) => {
    const index = e.detail.value;
    const subjects = getSubjectsForCollege(selectedCollege);
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
      fail: (err) => {
        // 用户取消选择是正常行为，不需要显示错误提示
        if (err.errMsg && err.errMsg.includes('cancel')) {
          return;
        }
        // 只有真正的错误才显示提示
        Taro.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    });
  };

  // 确认上传
  const handleConfirmUpload = async () => {
    // 检查登录状态
    const token = Taro.getStorageSync("token");
    if (!token) {
      Taro.showModal({
        title: '登录已过期',
        content: '登录状态已过期，请重新登录后再试',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 将当前页面路径作为重定向参数传递给登录页面
            Taro.navigateTo({
              url: `/pages/subpackage-profile/login/index?redirect=${encodeURIComponent('/pages/subpackage-discover/upload-material/index')}`
            });
          }
        }
      });
      return;
    }

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

      // 延迟返回学习资料页面
      setTimeout(() => {
        // 获取当前页面栈
        const pages = Taro.getCurrentPages();
        
        // 检查是否有登录页面需要清理
        let hasLoginPage = false;
        for (let i = 0; i < pages.length; i++) {
          if (pages[i].route?.includes('login')) {
            hasLoginPage = true;
            break;
          }
        }
        
        if (hasLoginPage) {
          // 如果有登录页面，使用 reLaunch 清理页面栈，但重建正确的导航结构
          // 先跳转到发现页面，再跳转到学习资料页面
          Taro.reLaunch({
            url: '/pages/discover/index'
          });
          
          // 延迟跳转到学习资料页面，确保发现页面在栈底
          setTimeout(() => {
            Taro.navigateTo({
              url: '/pages/subpackage-discover/learning-materials/index'
            });
          }, 100);
        } else {
          // 没有登录页面，直接返回到学习资料页面
          Taro.navigateBack();
        }
      }, 1500);
      
    } catch (error: any) {
      // 确保隐藏加载状态
      try {
        Taro.hideLoading();
      } catch (e) {
        // 忽略 hideLoading 的错误
      }
      
      // 根据错误类型提供不同的提示信息
      let errorMessage = '上传失败';
      let errorTitle = '上传失败';
      
      // 检查是否是413错误（文件过大）- 多种格式检测
      const is413Error = 
        error?.statusCode === 413 ||
        (error?.errMsg && error.errMsg.includes('413')) ||
        (error?.message && error.message.includes('413')) ||
        (error?.message && error.message.includes('文件大小超过限制')) ||
        (error?.data?.message && error.data.message.includes('413')) ||
        (error?.data?.status === 413) ||
        (error?.status === 413);
      
      if (is413Error) {
        errorTitle = '文件过大';
        errorMessage = `文件大小超过服务器限制，请选择小于${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB的文件`;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      }
      
      Taro.showModal({
        title: errorTitle,
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
              <Text className={styles.formatTip}>支持 PDF、Word、PPT 等格式，单个文件不超过 10MB</Text>
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
          range={getSubjectsForCollege(selectedCollege)}
          rangeKey='name'
          onChange={handleSubjectChange}
        >
          <View className={styles.subjectSelect}>
            <Text className={styles.selectText}>
              {selectedSubject ? getSubjectsForCollege(selectedCollege).find(s => s.value === selectedSubject)?.name : '请选择学科'}
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
