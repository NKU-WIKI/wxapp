import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import campusVerificationApi from '@/services/api/campus-verification';
import { CampusVerificationInfo, CampusVerificationRequest, VerificationDocumentLink } from '@/types/api/campus-verification';

interface CampusVerificationState {
  info: CampusVerificationInfo | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  submitStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CampusVerificationState = {
  info: null,
  status: 'idle',
  submitStatus: 'idle',
  error: null,
};

// 获取校园认证信息
export const fetchCampusVerificationInfo = createAsyncThunk(
  'campusVerification/fetchInfo',
  async () => {
    const response = await campusVerificationApi.getCampusVerificationInfo();
    const rawData = response.data;
    
    
    
    let applications: any[] = [];
    
    // 检查数据结构：可能是直接返回数组，也可能是包含applications属性的对象
    if (Array.isArray(rawData)) {
      // 直接返回数组的情�?      applications = rawData;
    } else if (rawData && rawData.applications && Array.isArray(rawData.applications)) {
      // 包含applications属性的对象
      applications = rawData.applications;
    }
    
    
    
    // 如果没有申请记录，返回未认证状�?    if (!applications || applications.length === 0) {
      
      return {
        is_verified: false,
        verification_status: undefined,
        verification_info: undefined,
      } as CampusVerificationInfo;
    }
    
    // 按提交时间倒序排序，获取最新的申请
    const sortedApplications = applications.sort((a, b) => 
      new Date(b.submitted_at || b.created_at).getTime() - new Date(a.submitted_at || a.created_at).getTime()
    );
    
    const latestApplication = sortedApplications[0];
    
    
    const verificationInfo: CampusVerificationInfo = {
      is_verified: latestApplication.status === 'approved',
      verification_status: latestApplication.status,
      verification_info: latestApplication,
    };
    
    return verificationInfo;
  }
);

// 提交校园认证申请
export const submitCampusVerification = createAsyncThunk(
  'campusVerification/submit',
  async (data: {
    real_name: string;
    id_number?: string;
    organization_name: string;
    student_id: string;
    department?: string;
    contact_phone?: string;
    card_image: string;
  }, { rejectWithValue }) => {
    try {
      
      
      // 先上传文�?      
      const uploadResponse = await campusVerificationApi.uploadFile(data.card_image);
      
      
      const fileUrl = (uploadResponse.data as any).url || (uploadResponse.data as any).file_url; // 兼容不同的返回格�?      
      
      if (!fileUrl) {
        
        return rejectWithValue('文件上传失败，请重试');
      }
      
      // 构建证件文档
      const document: VerificationDocumentLink = {
        document_type: 'student_id', // 固定为学生证
        file_url: fileUrl,
        file_name: 'student_card.jpg', // 可以从文件路径中提取
        mime_type: 'image/jpeg',
      };

      // 构建认证请求
      const verificationRequest: CampusVerificationRequest = {
        verification_type: 'student', // 固定为student
        real_name: data.real_name,
        id_number: data.id_number,
        organization_name: data.organization_name,
        student_id: data.student_id,
        department: data.department,
        contact_phone: data.contact_phone,
        documents: [document], // 至少需要一张证件照�?      };

      
      const response = await campusVerificationApi.submitCampusVerification(verificationRequest);
      
      
      return response.data;
    } catch (error: any) {
      
      //   message: error?.message,
      //   statusCode: error?.statusCode,
      //   data: error?.data,
      //   msg: error?.msg
      // });
      
      // 优化错误信息提取 - 处理409冲突错误
      if (error?.statusCode === 409 && error?.data?.detail) {
        
        return rejectWithValue(error.data.detail);
      }
      
      // 处理其他错误
      const errorMessage = error?.msg || error?.message || error?.data?.msg || '提交认证失败，请重试';
      return rejectWithValue(errorMessage);
    }
  }
);

const campusVerificationSlice = createSlice({
  name: 'campusVerification',
  initialState,
  reducers: {
    resetSubmitStatus: (state) => {
      state.submitStatus = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取认证信息
      .addCase(fetchCampusVerificationInfo.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCampusVerificationInfo.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.info = action.payload;
      })
      .addCase(fetchCampusVerificationInfo.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || '获取认证信息失败';
      })
      // 提交认证申请
      .addCase(submitCampusVerification.pending, (state) => {
        state.submitStatus = 'loading';
        state.error = null;
      })
      .addCase(submitCampusVerification.fulfilled, (state, _action) => {
        state.submitStatus = 'succeeded';
        // 提交成功后更新认证状态为自动审核�?        if (state.info) {
          state.info.verification_status = 'auto_reviewing';
        }
      })
      .addCase(submitCampusVerification.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.error = action.error.message || '提交认证失败';
      });
  },
});

export const { resetSubmitStatus } = campusVerificationSlice.actions;
export default campusVerificationSlice.reducer; 
