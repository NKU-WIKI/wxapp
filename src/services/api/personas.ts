import http from '../request'

/**
 * 获取场景定义列表
 * @returns
 */
export const getScenarios = () => {
  return http.get<any[]>('/persona/scenarios')
}

/**
 * 创建场景定义
 * @param data 场景创建数据
 * @returns
 */
export const createScenario = (data: { code: string; name: string; description?: string }) => {
  return http.post<any>('/persona/scenarios', data)
}

/**
 * 获取当前用户的场景偏好
 * @returns
 */
export const getMyScenarioPreferences = () => {
  return http.get<any[]>('/persona/me/scenario-preferences')
}

/**
 * 新增或更新当前用户的场景偏好
 * @param data 场景偏好数据
 * @returns
 */
export const upsertMyScenarioPreference = (data: {
  scenario_id?: string
  scenario_code?: string
  weight?: number
}) => {
  return http.post<any>('/persona/me/scenario-preferences', data)
}

// persona API对象
const personasApi = {
  getScenarios,
  createScenario,
  getMyScenarioPreferences,
  upsertMyScenarioPreference,
}

export default personasApi
