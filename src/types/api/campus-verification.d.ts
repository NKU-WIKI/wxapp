export interface VerificationDocumentLink {
  /** 证件类型 */
  document_type: string
  /** 证件图片的完整URL地址 */
  file_url: string
  /** 原始文件名 */
  file_name: string
  /** 文件MIME类型 */
  mime_type?: string
}

export interface CampusVerificationRequest {
  /** 认证类型 - 固定为student */
  verification_type: 'student'
  /** 真实姓名 */
  real_name: string
  /** 身份证号(18位),可选但推荐填写 */
  id_number?: string
  /** 组织机构名称 - 学生填写学校名称 */
  organization_name: string
  /** 学号或工号 - 学生认证时为学号 */
  student_id: string
  /** 院系或部门名称 */
  department?: string
  /** 联系电话,用于审核过程中的联系 */
  contact_phone?: string
  /** 证件图片链接列表,至少需要一张证件照片 */
  documents: VerificationDocumentLink[]
}

export interface CampusVerificationResponse {
  /** 认证ID */
  id: string
  /** 认证状态 */
  status:
    | 'draft'
    | 'auto_reviewing'
    | 'pending_manual_review'
    | 'approved'
    | 'rejected'
    | 'appealing'
    | 'expired'
    | 'pending'
  /** 提交时间 */
  created_at: string
  /** 审核时间 */
  reviewed_at?: string
  /** 审核备注 */
  review_note?: string
}

export interface CampusVerificationInfo {
  /** 是否已认证 */
  is_verified: boolean
  /** 认证状态 */
  verification_status?:
    | 'draft'
    | 'auto_reviewing'
    | 'pending_manual_review'
    | 'approved'
    | 'rejected'
    | 'appealing'
    | 'expired'
    | 'pending'
  /** 认证信息 */
  verification_info?: CampusVerificationResponse
}

export interface CampusVerificationApplicationsResponse {
  /** 申请记录列表 */
  applications: CampusVerificationResponse[]
  /** 总数 */
  total: number
}
