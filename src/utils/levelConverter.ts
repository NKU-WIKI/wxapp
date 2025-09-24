/**
 * �ȼ�ϵͳת������
 * �����ֵȼ�ת��Ϊ���ɾ�������
 */

// ���ɾ���ӳ���
const LEVEL_MAPPING = {
  0: '������',
  1: '������',
  2: '�ᵤ��',
  3: 'ԪӤ��',
  4: '������',
  5: '������',
  6: '������',
  7: '������',
} as const

/**
 * ���ȼ�����ת��Ϊ���ɾ�������
 * @param level �ȼ����� (0-7)
 * @returns ���ɾ�������
 */
export function convertLevelToRealm(level: number): string {
  if (level < 0 || level > 7) {
    return '������'
  }

  return LEVEL_MAPPING[level as keyof typeof LEVEL_MAPPING]
}

/**
 * �����ȼ��ַ�����ת��Ϊ���ɾ�������
 * ֧�ָ�ʽ: "Lv0", "Lv1", "Lv2" ��
 * @param levelString �ȼ��ַ���
 * @returns ���ɾ�������
 */
export function parseLevelString(levelString: string): string {
  // ��ȡ���ֲ���
  const match = levelString.match(/Lv(\d+)/i)
  if (!match) {
    return '������'
  }

  const level = parseInt(match[1], 10)
  return convertLevelToRealm(level)
}

/**
 * ��ȡ���п��õ����ɾ����б�
 * @returns ���ɾ�������
 */
export function getAllRealms(): string[] {
  return Object.values(LEVEL_MAPPING)
}

/**
 * �������ɾ������ƻ�ȡ��Ӧ�ĵȼ�����
 * @param realm ���ɾ�������
 * @returns �ȼ����֣����δ�ҵ����� -1
 */
export function getLevelFromRealm(realm: string): number {
  const entry = Object.entries(LEVEL_MAPPING).find(([, value]) => value === realm)
  return entry ? parseInt(entry[0], 10) : -1
}
