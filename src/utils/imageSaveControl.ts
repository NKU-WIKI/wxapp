/**
 * 图片保存权限控制工具
 */

import { RootState } from '@/store/rootReducer'
import store from '@/store'
import Taro from '@tarojs/taro'

/**
 * 检查当前用户是否允许图片被保存
 */
export const isImageSavingAllowed = (): boolean => {
  const state = store.getState() as RootState
  return state.settings.allowImageSaving
}

/**
 * 检查是否可以保存指定用户发布的图片
 * @param authorId 图片作者ID
 * @param authorSettings 作者的设置（可选，如果有的话可以直接传入）
 */
export const canSaveUserImage = (
  authorId: string,
  authorSettings?: { allowImageSaving: boolean }
): boolean => {
  // 如果是自己发布的图片，总是可以保存
  const currentUser = store.getState().user.user
  if (currentUser && currentUser.id === authorId) {
    return true
  }

  // 如果传入了作者设置，直接使用
  if (authorSettings) {
    return authorSettings.allowImageSaving
  }

  // 如果没有作者设置，默认允许保存（向后兼容）
  // 实际实现中应该从后端获取作者的设置
  return true
}

/**
 * 尝试保存图片到相册
 * 如果用户不允许保存，会显示相应的提示
 */
export const saveImageToAlbum = async (
  imageUrl: string,
  authorId: string,
  authorSettings?: { allowImageSaving: boolean }
): Promise<boolean> => {
  try {
    // 检查是否允许保存
    if (!canSaveUserImage(authorId, authorSettings)) {
      Taro.showToast({
        title: '作者不允许保存图片',
        icon: 'none',
        duration: 2000,
      })
      return false
    }

    // 请求保存图片权限
    const authRes = await Taro.getSetting()
    if (!authRes.authSetting['scope.writePhotosAlbum']) {
      try {
        await Taro.authorize({ scope: 'scope.writePhotosAlbum' })
      } catch (authError) {
        // 用户拒绝授权，引导用户去设置页面
        const modalRes = await Taro.showModal({
          title: '需要相册权限',
          content: '需要获取相册权限来保存图片，是否去设置页面开启？',
          confirmText: '去设置',
          cancelText: '取消',
        })

        if (modalRes.confirm) {
          await Taro.openSetting()
        }
        return false
      }
    }

    // 下载图片
    const downloadRes = await Taro.downloadFile({
      url: imageUrl,
    })

    if (downloadRes.statusCode === 200) {
      // 保存到相册
      await Taro.saveImageToPhotosAlbum({
        filePath: downloadRes.tempFilePath,
      })

      Taro.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 2000,
      })
      return true
    } else {
      throw new Error('图片下载失败')
    }
  } catch (error) {
    let errorMessage = '保存失败'

    if (error && typeof error === 'object' && 'errMsg' in error) {
      const errMsg = (error as any).errMsg
      if (errMsg.includes('saveImageToPhotosAlbum:fail auth deny')) {
        errorMessage = '用户拒绝了相册权限'
      } else if (errMsg.includes('saveImageToPhotosAlbum:fail')) {
        errorMessage = '保存到相册失败'
      }
    }

    Taro.showToast({
      title: errorMessage,
      icon: 'none',
      duration: 2000,
    })
    return false
  }
}

/**
 * 显示图片操作菜单
 * 根据作者设置决定是否显示"保存图片"选项
 */
export const showImageActionSheet = async (
  imageUrl: string,
  authorId: string,
  authorSettings?: { allowImageSaving: boolean }
): Promise<void> => {
  const actionItems = ['预览图片']

  // 只有在允许保存的情况下才显示保存选项
  if (canSaveUserImage(authorId, authorSettings)) {
    actionItems.push('保存图片')
  }

  try {
    const res = await Taro.showActionSheet({
      itemList: actionItems,
    })

    const selectedAction = actionItems[res.tapIndex]

    if (selectedAction === '预览图片') {
      Taro.previewImage({
        urls: [imageUrl],
        current: imageUrl,
      })
    } else if (selectedAction === '保存图片') {
      await saveImageToAlbum(imageUrl, authorId, authorSettings)
    }
  } catch (error) {
    // 用户取消了操作
  }
}
