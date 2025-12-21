import { useEffect, useState } from 'react'
// eslint-disable-next-line sort-imports
import { message, Space, Switch, Typography } from 'antd'
import { BellFilled, BellOutlined } from '@ant-design/icons'
import { useUserId } from '@utils/hooks/useUserId'
import { registerPushNotifications, unsubscribeFromPush } from '@utils/pushNotifications'

const { Text } = Typography

export const PushNotificationManager = () => {
   const { userId, loading: userLoading } = useUserId()
   const [isSubscribed, setIsSubscribed] = useState(false)
   const [isLoading, setIsLoading] = useState(false)
   const [permission, setPermission] = useState<NotificationPermission>('default')

   useEffect(() => {
      if (typeof window !== 'undefined' && 'Notification' in window) {
         setPermission(Notification.permission)
         checkSubscriptionStatus()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [userId])

   const checkSubscriptionStatus = async () => {
      if (!userId || !('serviceWorker' in navigator)) return

      try {
         const registration = await navigator.serviceWorker.ready
         const subscription = await registration.pushManager.getSubscription()
         setIsSubscribed(!!subscription)
      } catch (error) {
         console.error('Ошибка проверки статуса подписки:', error)
      }
   }

   const handleEnableNotifications = async () => {
      if (!userId) {
         message.warning('Необходимо авторизоваться')
         return
      }

      setIsLoading(true)
      try {
         const success = await registerPushNotifications(userId)
         if (success) {
            setIsSubscribed(true)
            setPermission('granted')
            message.success('Уведомления включены!')
         } else {
            message.error('Не удалось включить уведомления')
         }
      } catch (error: any) {
         message.error(error.message || 'Ошибка включения уведомлений')
      } finally {
         setIsLoading(false)
      }
   }

   const handleDisableNotifications = async () => {
      if (!userId) {
         return
      }

      setIsLoading(true)
      try {
         const registration = await navigator.serviceWorker.ready
         const subscription = await registration.pushManager.getSubscription()

         if (subscription) {
            const success = await unsubscribeFromPush(userId, subscription.endpoint)
            if (success) {
               setIsSubscribed(false)
               message.success('Уведомления отключены')
            } else {
               message.error('Не удалось отключить уведомления')
            }
         }
      } catch (error: any) {
         message.error(error.message || 'Ошибка отключения уведомлений')
      } finally {
         setIsLoading(false)
      }
   }

   const handleToggle = async (checked: boolean) => {
      if (checked) {
         await handleEnableNotifications()
      } else {
         await handleDisableNotifications()
      }
   }

   if (userLoading) {
      return null
   }

   if (!userId) {
      return (
         <Space>
            <BellOutlined />
            <Text type="secondary">Войдите, чтобы получать уведомления</Text>
         </Space>
      )
   }

   if (!('Notification' in window)) {
      return (
         <Space>
            <BellOutlined />
            <Text type="secondary">Ваш браузер не поддерживает уведомления</Text>
         </Space>
      )
   }

   if (permission === 'denied') {
      return (
         <Space direction="vertical" size="small">
            <Space>
               <BellOutlined style={{ color: '#ff4d4f' }} />
               <Text type="danger">Уведомления заблокированы в настройках браузера</Text>
            </Space>
            <Text type="secondary" style={{ fontSize: '12px' }}>
               Разблокируйте уведомления в настройках браузера
            </Text>
         </Space>
      )
   }

   return (
      <Space>
         {isSubscribed ? <BellFilled style={{ color: '#52c41a' }} /> : <BellOutlined />}
         <Text>Push-уведомления</Text>
         <Switch checked={isSubscribed} onChange={handleToggle} loading={isLoading} disabled={false} />
      </Space>
   )
}
