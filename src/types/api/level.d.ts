export interface LevelRule {
  id?: string | number;
  /** 规则名称，例如“每日登录” */
  title?: string;
  /** 规则描述 */
  description?: string;
  /** 完成一次可获得的经验值 */
  exp?: number;
}

export interface LevelInfo {
  /** 当前等级 */
  level: number;
  /** 当前累计经验值 */
  exp: number;
  /** 下一等级所需经验（可能在满级时为 null） */
  next_level_exp?: number | null;
  /** 上一等级起始经验（可选） */
  prev_level_exp?: number | null;
  /** 进度（可能是 0-100 或 0-1，小程序端做归一化处理） */
  progress: number;
  /** 等级名称，如“青铜 I” */
  level_name: string;
  /** 下一等级名称 */
  next_level_name?: string | null;
  /** 经验规则 */
  rules?: LevelRule[];
}

/** 今日经验明细记录（服务器默认返回今日） */
export interface ExperienceRecord {
  id: number;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  /** 事件类型：如 login / like_received / comment */
  event_type: string;
  /** 可选描述 */
  description?: string;
  /** 经验增量 */
  delta: number;
}

export interface ExperienceRecordPage {
  items: ExperienceRecord[];
  total: number;
  page: number;
  page_size: number;
}

export type ExperienceRecordList = ExperienceRecord[]; 