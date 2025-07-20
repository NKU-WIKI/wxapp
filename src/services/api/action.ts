import http from '../request';
import { BaseResponse } from '@/types/api/common';
import { ToggleActionParams, ToggleActionResponse } from '@/types/api/action.d';

const actionApi = {
  toggleAction: (params: ToggleActionParams) => {
    console.log(params);
    const res = http.post<ToggleActionResponse>('/wxapp/action/toggle', params);
    console.log(res);
    return res
    },
};

export default actionApi;
