import Taro from '@tarojs/taro';
import {
  LearningMaterial,
  LearningMaterialCategory,
  getFileTypeFromExtension,
} from '@/types/api/learningMaterial';

const STORAGE_KEY = 'learningMaterials';

/**
 * 学习资料本地存储管理
 */
export class LearningMaterialService {
  /**
   * 获取所有学习资料
   */
  static getAllMaterials(): LearningMaterial[] {
    try {
      const materials = Taro.getStorageSync(STORAGE_KEY) || [];
      return materials;
    } catch {
      return [];
    }
  }

  /**
   * 根据分类获取学习资料
   */
  static getMaterialsByCategory(category: LearningMaterialCategory): LearningMaterial[] {
    const allMaterials = this.getAllMaterials();
    return allMaterials.filter((material) => material.category === category);
  }

  /**
   * 搜索学习资料
   */
  static searchMaterials(keyword: string): LearningMaterial[] {
    if (!keyword.trim()) {
      return this.getAllMaterials();
    }

    const allMaterials = this.getAllMaterials();
    const lowerKeyword = keyword.toLowerCase();

    return allMaterials.filter(
      (material) =>
        material.title.toLowerCase().includes(lowerKeyword) ||
        material.description.toLowerCase().includes(lowerKeyword) ||
        material.college.toLowerCase().includes(lowerKeyword) ||
        material.subject.toLowerCase().includes(lowerKeyword) ||
        (material.originalFileName &&
          material.originalFileName.toLowerCase().includes(lowerKeyword)),
    );
  }

  /**
   * 添加学习资料
   */
  static addMaterial(
    materialData: Partial<LearningMaterial> & { [key: string]: unknown },
  ): LearningMaterial {
    const materials = this.getAllMaterials();

    // 优先使用用户提供的分类，如果没有则自动推断
    const category =
      materialData.category ||
      this.inferCategory(materialData.subject || '', materialData.description || '');

    // 安全地获取字符串值
    const getStringValue = (value: unknown): string => {
      if (typeof value === 'string') return value;
      return '';
    };

    // 安全地获取数字值
    const getNumberValue = (value: unknown): number => {
      if (typeof value === 'number') return value;
      return 0;
    };

    // 安全地获取签名类型
    const getSignatureType = (value: unknown): 'anonymous' | 'realname' => {
      if (value === 'realname') return 'realname';
      return 'anonymous';
    };

    const originalFileName = getStringValue(materialData.original_file_name);

    const newMaterial: LearningMaterial = {
      id: Date.now().toString(),
      title: originalFileName || getStringValue(materialData.description) || '未命名资料',
      description: getStringValue(materialData.description),
      college: getStringValue(materialData.college),
      subject: getStringValue(materialData.subject),
      signatureType: getSignatureType(materialData.signature_type),
      fileUrl: getStringValue(materialData.file_url),
      fileName: getStringValue(materialData.server_file_name),
      originalFileName: originalFileName,
      netdiskLink: getStringValue(materialData.netdisk_link),
      qrCodeUrl: getStringValue(materialData.qr_code_url),
      fileSize: getNumberValue(materialData.file_size),
      fileType: getFileTypeFromExtension(originalFileName),
      uploadTime: new Date().toISOString(),
      category: category,
      downloadCount: 0,
      rating: 0,
      // 添加linkId支持新的下载API
      linkId:
        getStringValue(materialData.link_id) ||
        getStringValue(materialData.linkId) ||
        getStringValue(materialData.id),
    };

    materials.unshift(newMaterial); // 添加到开头

    Taro.setStorageSync(STORAGE_KEY, materials);
    return newMaterial;
  }

  /**
   * 根据学科和描述推断分类
   */
  private static inferCategory(subject?: string, description?: string): LearningMaterialCategory {
    const text = `${subject} ${description}`.toLowerCase();

    if (text.includes('考研') || text.includes('研究生')) {
      return LearningMaterialCategory.GRADUATE_EXAM;
    }
    if (text.includes('期末') || text.includes('考试') || text.includes('真题')) {
      return LearningMaterialCategory.FINAL_EXAM;
    }
    if (text.includes('笔记') || text.includes('notes')) {
      return LearningMaterialCategory.COURSE_NOTES;
    }
    if (text.includes('实验') || text.includes('报告') || text.includes('lab')) {
      return LearningMaterialCategory.LAB_REPORT;
    }
    if (text.includes('书') || text.includes('教材') || text.includes('book')) {
      return LearningMaterialCategory.EBOOK;
    }

    return LearningMaterialCategory.OTHER;
  }

  /**
   * 获取分类统计
   */
  static getCategoryStats(): Record<LearningMaterialCategory, number> {
    const materials = this.getAllMaterials();
    const stats: Record<LearningMaterialCategory, number> = {
      [LearningMaterialCategory.COURSE_NOTES]: 0,
      [LearningMaterialCategory.FINAL_EXAM]: 0,
      [LearningMaterialCategory.EBOOK]: 0,
      [LearningMaterialCategory.GRADUATE_EXAM]: 0,
      [LearningMaterialCategory.LAB_REPORT]: 0,
      [LearningMaterialCategory.OTHER]: 0,
    };

    materials.forEach((material) => {
      stats[material.category]++;
    });

    return stats;
  }

  /**
   * 检查并导入本地上传的资料数据
   */
  static checkAndImportUploadData(): LearningMaterial | null {
    try {
      const uploadData = Taro.getStorageSync('uploadMaterialData');
      if (uploadData && uploadData.file_name) {
        // 如果有上传数据，导入为学习资料
        const material = this.addMaterial(uploadData);

        // 清除上传数据
        Taro.removeStorageSync('uploadMaterialData');

        return material;
      }
    } catch {
      // 忽略错误
    }
    return null;
  }
}

/**
 * 分类配置
 */
export const CATEGORY_CONFIG: Record<
  LearningMaterialCategory,
  { title: string; icon: string; description: string }
> = {
  [LearningMaterialCategory.COURSE_NOTES]: {
    title: '课程笔记',
    icon: '📚',
    description: '课堂笔记、学习总结',
  },
  [LearningMaterialCategory.FINAL_EXAM]: {
    title: '期末真题',
    icon: '📝',
    description: '历年真题、考试资料',
  },
  [LearningMaterialCategory.EBOOK]: {
    title: '电子书',
    icon: '📖',
    description: '教材、参考书籍',
  },
  [LearningMaterialCategory.GRADUATE_EXAM]: {
    title: '考研资料',
    icon: '🎓',
    description: '考研真题、复习资料',
  },
  [LearningMaterialCategory.LAB_REPORT]: {
    title: '实验报告',
    icon: '🔬',
    description: '实验指导、报告模板',
  },
  [LearningMaterialCategory.OTHER]: {
    title: '其他资料',
    icon: '📁',
    description: '其他学习资料',
  },
};

export default LearningMaterialService;
