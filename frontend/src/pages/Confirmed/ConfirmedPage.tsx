import { useEffect, useState } from 'react'
import { Button, Flex, Form, FormProps, Input, message } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '@supabaseDir/supabaseClient'
import { useAuth } from '@context/providers/AuthProvider/AuthProvider'
import { set_cookie } from '@utils/auth'
import { localizeSupabaseError } from '@utils/authErrors'
import s from './ConfirmedPage.module.scss'

const ConfirmedPage = () => {
   const navigate = useNavigate()
   const location = useLocation()
   const { signin } = useAuth()
   const [messageApi, contextHolder] = message.useMessage()
   const [form] = Form.useForm()
   const [loading, setLoading] = useState(false)
   const [resending, setResending] = useState(false)

   const email = location.state?.email || ''

   const layout: FormProps = {
      colon: false,
      labelAlign: 'left',
      labelCol: { span: 8 },
      wrapperCol: { span: 15 },
   }

   useEffect(() => {
      const checkAccess = async () => {
         const {
            data: { session },
         } = await supabase.auth.getSession()

         // Если пользователь авторизован, но это не flow регистрации (нет email в state) — отправляем на главную
         if (session && !email) {
            navigate('/', { replace: true })
            return
         }

         // Если пользователь не авторизован и нет email из шага регистрации — отправляем на логин
         if (!session && !email) {
            navigate('/login', { replace: true })
         }
      }

      void checkAccess()
   }, [email, navigate])

   const handleVerifyCode = async (values: { code: string }) => {
      if (!email) {
         messageApi.error('Email не найден. Пожалуйста, пройдите регистрацию заново.')
         navigate('/login')
         return
      }

      setLoading(true)
      try {
         const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
         const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

         if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Не настроены переменные окружения Supabase')
         }

         const response = await fetch(`${supabaseUrl}/auth/v1/verify`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               apikey: supabaseAnonKey,
               Authorization: `Bearer ${supabaseAnonKey}`,
            },
            body: JSON.stringify({
               type: 'signup',
               email,
               token: values.code,
            }),
         })

         if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}))
            const messageText = errorBody?.error_description || errorBody?.message || 'Неверный код подтверждения'
            throw new Error(messageText)
         }

         const data = await response.json()

         const { access_token, refresh_token } = data
         if (!access_token || !refresh_token) {
            throw new Error('Не удалось получить токены авторизации')
         }

         // Сохраняем сессию в Supabase клиенте
         const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
         })
         if (sessionError) {
            throw sessionError
         }

         // Сохраняем токены в cookies, как при обычном логине
         signin(() => {
            set_cookie({ name: 'access_token', value: access_token })
            set_cookie({ name: 'refresh_token', value: refresh_token })
            navigate('/', { replace: true })
         })

         messageApi.success('Email успешно подтверждён. Выполняем вход...')
      } catch (err: any) {
         const localizedMessage = localizeSupabaseError(err.message)
         messageApi.error('Неверный код: ' + localizedMessage)
      } finally {
         setLoading(false)
      }
   }

   const handleResendCode = async () => {
      if (!email) {
         messageApi.error('Email не найден')
         return
      }

      setResending(true)
      try {
         const { error } = await supabase.auth.resend({
            type: 'signup',
            email,
         })

         if (error) throw error

         messageApi.success('Новый код отправлен на вашу почту')
      } catch (err: any) {
         const localizedMessage = localizeSupabaseError(err.message)
         messageApi.error('Ошибка отправки: ' + localizedMessage)
      } finally {
         setResending(false)
      }
   }

   if (!email) return null

   return (
      <div className={s['wrap-confirmed']}>
         {contextHolder}
         <div className={s['wrap-confirmed__block']}>
            <div className={s['wrap-confirmed__block-header']}>
               <h2>Подтвердите регистрацию</h2>
            </div>
            <div className={s['wrap-confirmed__block-content']}>
               <p style={{ marginBottom: '24px', textAlign: 'center' }}>
                  Введите код подтверждения, отправленный на <strong>{email}</strong>
               </p>
               <Form {...layout} form={form} name="confirm_form" onFinish={handleVerifyCode} requiredMark={false}>
                  <Form.Item
                     name="code"
                     label="Код подтверждения"
                     rules={[{ required: true, message: 'Введите код подтверждения' }]}
                  >
                     <Input placeholder="Введите код из письма" maxLength={6} />
                  </Form.Item>

                  <Form.Item wrapperCol={{ ...layout.wrapperCol }} label=" ">
                     <Flex gap="small">
                        <Button block size="large" type="primary" htmlType="submit" loading={loading}>
                           Подтвердить
                        </Button>
                        <Button block size="large" onClick={handleResendCode} loading={resending} disabled={loading}>
                           Запросить новый код
                        </Button>
                     </Flex>
                  </Form.Item>
               </Form>
            </div>
         </div>
      </div>
   )
}

export default ConfirmedPage
