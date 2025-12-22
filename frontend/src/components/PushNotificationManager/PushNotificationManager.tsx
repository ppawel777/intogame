import { useEffect, useState } from 'react'
// eslint-disable-next-line sort-imports
import { message, Switch, Typography } from 'antd'
import { BellFilled, BellOutlined } from '@ant-design/icons'
import { useUserId } from '@utils/hooks/useUserId'
import { registerPushNotifications, unsubscribeFromPush } from '@utils/pushNotifications'
import styles from './PushNotificationManager.module.scss'

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
         <div className={styles.container}>
            <div className={styles.leftSection}>
               <BellOutlined className={styles.icon} />
               <Text type="secondary" className={styles.text}>
                  Войдите, чтобы получать уведомления
               </Text>
            </div>
         </div>
      )
   }

   if (!('Notification' in window)) {
      return (
         <div className={styles.container}>
            <div className={styles.leftSection}>
               <BellOutlined className={styles.icon} />
               <Text type="secondary" className={styles.text}>
                  Ваш браузер не поддерживает уведомления
               </Text>
            </div>
         </div>
      )
   }

   if (permission === 'denied') {
      return (
         <div className={styles.container}>
            <div className={styles.leftSection}>
               <BellOutlined className={styles.icon} style={{ color: '#ff4d4f' }} />
               <div style={{ flex: 1 }}>
                  <Text type="danger" className={styles.text} style={{ display: 'block', marginBottom: '4px' }}>
                     Уведомления заблокированы в настройках браузера
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                     Разблокируйте уведомления в настройках браузера
                  </Text>
               </div>
            </div>
         </div>
      )
   }

   return (
      <div className={styles.container}>
         <div className={styles.leftSection}>
            {isSubscribed ? (
               <BellFilled className={styles.icon} style={{ color: '#52c41a' }} />
            ) : (
               <BellOutlined className={styles.icon} />
            )}
            <Text className={styles.text}>Push-уведомления</Text>
         </div>
         <div className={styles.rightSection}>
            <Switch
               className={styles.switch}
               checked={isSubscribed}
               onChange={handleToggle}
               loading={isLoading}
               disabled={false}
            />
         </div>
      </div>
   )
}
