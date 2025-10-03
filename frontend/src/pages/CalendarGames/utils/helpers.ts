import { BadgeProps } from 'antd'

export const statusToBadgeType: Record<string, BadgeProps['status']> = {
   Завершена: 'default',
   Активна: 'success',
   Отменена: 'error',
}
