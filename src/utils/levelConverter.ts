/**
 * 等级系统转换工具
 * 将数字等级转换为修仙境界名称
 */

// 修仙境界映射表
const LEVEL_MAPPING = {
  0: "炼气期",
  1: "筑基期", 
  2: "结丹期",
  3: "元婴期",
  4: "化神期",
  5: "真仙期",
  6: "金仙期",
  7: "道祖期"
} as const;

/**
 * 将等级数字转换为修仙境界名称
 * @param level 等级数字 (0-7)
 * @returns 修仙境界名称
 */
export function convertLevelToRealm(level: number): string {
  if (level < 0 || level > 7) {
    console.warn(`Invalid level: ${level}, using default realm`);
    return "炼气期";
  }
  
  return LEVEL_MAPPING[level as keyof typeof LEVEL_MAPPING];
}

/**
 * 解析等级字符串并转换为修仙境界名称
 * 支持格式: "Lv0", "Lv1", "Lv2" 等
 * @param levelString 等级字符串
 * @returns 修仙境界名称
 */
export function parseLevelString(levelString: string): string {
  // 提取数字部分
  const match = levelString.match(/Lv(\d+)/i);
  if (!match) {
    console.warn(`Invalid level string format: ${levelString}`);
    return "炼气期";
  }
  
  const level = parseInt(match[1], 10);
  return convertLevelToRealm(level);
}

/**
 * 获取所有可用的修仙境界列表
 * @returns 修仙境界数组
 */
export function getAllRealms(): string[] {
  return Object.values(LEVEL_MAPPING);
}

/**
 * 根据修仙境界名称获取对应的等级数字
 * @param realm 修仙境界名称
 * @returns 等级数字，如果未找到返回 -1
 */
export function getLevelFromRealm(realm: string): number {
  const entry = Object.entries(LEVEL_MAPPING).find(([, value]) => value === realm);
  return entry ? parseInt(entry[0], 10) : -1;
}
