export interface CampusVerificationRequest {
  /** 真实姓名 */
  name: string;
  /** 学号 */
  student_id: string;
  /** 校园卡照片文件路径 */
  card_image: string;
}

export interface CampusVerificationResponse {
  /** 认证ID */
  id: string;
  /** 认证状态 */
  status: 'pending' | 'approved' | 'rejected';
  /** 提交时间 */
  created_at: string;
  /** 审核时间 */
  reviewed_at?: string;
  /** 审核备注 */
  review_note?: string;
}

export interface CampusVerificationInfo {
  /** 是否已认证 */
  is_verified: boolean;
  /** 认证状态 */
  verification_status?: 'pending' | 'approved' | 'rejected';
  /** 认证信息 */
  verification_info?: CampusVerificationResponse;
} 