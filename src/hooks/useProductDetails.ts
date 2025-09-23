import { useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { marketplaceApi } from '@/services/api/marketplace'

interface UseProductDetailsOptions {
  onLoadingChange?: (loading: boolean) => void
  onError?: (error: Error) => void
}

export const useProductDetails = (options: UseProductDetailsOptions = {}) => {
  const dispatch = useDispatch()
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  const loadProductDetails = useCallback(async (productIds: string[]) => {
    if (productIds.length === 0) return

    try {
      setIsLoadingDetails(true)
      options.onLoadingChange?.(true)

      // 批量获取商品详情
      const detailPromises = productIds.map(async (id) => {
        try {
          const response = await marketplaceApi.getListingDetail(id)
          return { id, data: response.data }
        } catch (error) {
          return null
        }
      })

      const results = await Promise.all(detailPromises)
      const validResults = results.filter(result => result !== null)

      // 更新 Redux store 中的商品详情
      validResults.forEach(({ id, data }) => {
        dispatch({
          type: 'marketplace/updateListingDetail',
          payload: { id, data }
        })
      })

      return validResults
    } catch (error) {
      options.onError?.(error as Error)
      return []
    } finally {
      setIsLoadingDetails(false)
      options.onLoadingChange?.(false)
    }
  }, [dispatch, options])

  return {
    loadProductDetails,
    isLoadingDetails
  }
}
