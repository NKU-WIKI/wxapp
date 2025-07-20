import http from '../request';
import { ToggleActionParams, ToggleActionResponse } from '@/types/api/action.d';

const actionApi = {
  toggleAction: (data: ToggleActionParams) => {
    return http.post<ToggleActionResponse>('/wxapp/action/toggle', data, {
      header: {
        'X-No-Loading': true,
      },
    });
  },
};

export default actionApi; 