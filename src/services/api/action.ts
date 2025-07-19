import http from '../request';
import { BaseResponse } from '@/types/api/common';
import { ToggleActionParams, ToggleActionResponse } from '@/types/api/action.d';

const actionApi = {
  toggleAction: (params: ToggleActionParams) => {
    return http.post<ToggleActionResponse>('/wxapp/action/toggle', params);
  },
};

export default actionApi; 