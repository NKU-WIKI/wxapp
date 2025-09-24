/**
 * 等级系统转换器
 * 将数值等级转换为修仙境界名称
 */

// 修仙境界映射
const LEVEL_MAPPING = {
  0: "炼气期",
  1: "筑基期",
  2: "金丹期",
  3: "元婴期",
  4: "化神期",
  5: "炼虚期",
  6: "合体期",
  7: "大乘期"
} as const;

/**
 * 将等级数值转换为修仙境界名称
 * @param level 等级数值 (0-7)
 * @returns 修仙境界名称
 */
export function convertLevelToRealm(level: number): string {
  if (level < 0 || level > 7) {
    return "凡人";
  }

  return LEVEL_MAPPING[level as keyof typeof LEVEL_MAPPING];
}

/**
 * 将等级字符串转换为修仙境界名称
 * 支持格式: "Lv0", "Lv1", "Lv2" 等
 * @param levelString 等级字符串
 * @returns 修仙境界名称
 */
export function parseLevelString(levelString: string): string {
  // 获取数字部分
  const match = levelString.match(/Lv(\d+)/i);
  if (!match) {
    return "凡人";
  }

  const level = parseInt(match[1], 10);
  return convertLevelToRealm(level);
}

/**
 * 获取所有可用的修仙境界列表
 * @returns 修仙境界列表
 */
export function getAllRealms(): string[] {
  return Object.values(LEVEL_MAPPING);
}

/**
 * 根据修仙境界名称获取对应的等级数值
 * @param realm 修仙境界名称
 * @returns 等级数值，未找到则返回 -1
 */
export function getLevelFromRealm(realm: string): number {
  const entry = Object.entries(LEVEL_MAPPING).find(([, value]) => value === realm);
  return entry ? parseInt(entry[0], 10) : -1;
}
