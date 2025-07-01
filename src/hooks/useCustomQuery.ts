import { UseQueryOptions, useQuery } from '@tanstack/react-query'
import { message } from 'antd'

export const useCustomQuery = <TQueryFnData = any, TError = Error, TData = TQueryFnData>(
   options: UseQueryOptions<TQueryFnData, TError, TData>,
) => {
   return useQuery({
      ...options,
      onError: (error) => {
         message.error(`Ошибка: ${(error as Error).message}`)
         if (options.onError) {
            options.onError(error)
         }
      },
   })
}
