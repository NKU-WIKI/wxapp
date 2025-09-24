import { ToggleActionRequest, ToggleActionResponse } from '@/types/api/action'

import http from '../request'


/**
 * 切换用户交互状态 (点赞/收藏/关注)
 * @param data
 * @returns
 */
export const toggleAction = (data: ToggleActionRequest) => {
  return http.post<ToggleActionResponse>('/actions/toggle', data, {
    // 根据项目规范，交互类API不显示全局加载提示
    header: {
      'X-Show-Loading': false,
    },
  })
}

// 动作API对象
const actionApi = {
  toggleAction,
}

export default actionApi
