import { UseMutationOptions, useMutation } from '@tanstack/react-query'
import { message } from 'antd'

export const useCustomMutation = <TData = unknown, TError = Error, TVariables = void>(
   options: UseMutationOptions<TData, TError, TVariables>,
) => {
   return useMutation({
      ...options,
      onError: (error, variables, context) => {
         message.error(`Ошибка: ${(error as Error).message}`)
         if (options.onError) {
            options.onError(error, variables, context)
         }
      },
   })
}
