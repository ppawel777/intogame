/* eslint-disable max-len */
import { useEffect, useState } from 'react'
import { Button, Flex, Form, FormProps, Input, InputNumber, Modal, message } from 'antd'
import { supabase } from '@supabaseDir/supabaseClient'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@context/providers/AuthProvider/AuthProvider'
import { set_cookie } from '@utils/auth'
import { Session } from '@supabase/supabase-js'

import s from './LoginPage.module.scss'
import { localizeSupabaseError } from '@utils/authErrors'

const LoginPage = () => {
   const navigate = useNavigate()
   const location = useLocation()
   const { signin } = useAuth()

   const [messageApi, contextHolder] = message.useMessage()
   const [form] = Form.useForm()
   const [isRegistering, setIsRegistering] = useState(false)
   const [loading, setLoading] = useState(false)
   const [submitTime, setSubmitTime] = useState<number | null>(null)
   const [showForgotPassword, setShowForgotPassword] = useState<string | false>(false)
   const [isResetModalOpen, setIsResetModalOpen] = useState(false)
   const [resetEmail, setResetEmail] = useState<string>('')

   const [honeypotName] = useState('custom_field_' + Math.random().toString(36).substr(2, 9))

   // Проверка recovery-ссылки при загрузке
   useEffect(() => {
      const params = new URLSearchParams(window.location.search)
      const type = params.get('type')
      const email = params.get('email')

      if (type === 'recovery' && email) {
         setResetEmail(email)
         setIsResetModalOpen(true)
         // Очищаем параметры, чтобы не открывать модалку при F5
         window.history.replaceState(null, '', window.location.pathname)
      }
   }, [])

   useEffect(() => {
      setSubmitTime(Date.now())
   }, [isRegistering])

   const from = location.state?.from || '/'

   const handleSignIn = (session: Session) => {
      const { access_token, refresh_token } = session
      signin(() => {
         set_cookie({ name: 'access_token', value: access_token })
         set_cookie({ name: 'refresh_token', value: refresh_token })
         navigate(from, { replace: true })
      })
   }

   const handleAuth = async (values: any) => {
      setLoading(true)
      console.log('signup OK, navigating to /confirmed', values.email)
      try {
         if (isRegistering) {
            const { error } = await supabase.auth.signUp({
               email: values.email,
               password: values.password,
               options: {
                  data: {
                     user_name: values.user_name,
                     user_phone: values.phone,
                  },
               },
            })

            if (error) throw error

            // Запись в public.users теперь создаётся триггером в БД (после вставки в auth.users)
            // Поэтому на фронте ничего дополнительно не вставляем

            // После успешной регистрации перенаправляем на страницу подтверждения
            messageApi.success('Регистрация успешна! Проверьте почту для подтверждения email.')
            navigate('/confirmed', { state: { email: values.email } })
         } else {
            const { data, error } = await supabase.auth.signInWithPassword({
               email: values.email,
               password: values.password,
            })
            if (error) throw error
            data.session && handleSignIn(data.session)
         }
      } catch (error: any) {
         const localizedMessage = localizeSupabaseError(error.message)

         if (error.status === 400 && error.message === 'Invalid login credentials') {
            setShowForgotPassword(values.email)
         } else {
            setShowForgotPassword(false)
         }

         messageApi.error(localizedMessage)
      } finally {
         setLoading(false)
      }
   }

   const handleForgotPassword = async (email: string) => {
      setLoading(true)
      try {
         const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}${window.location.pathname}?type=recovery&email=${encodeURIComponent(email)}`,
         })

         if (error) throw error

         setResetEmail(email) // Сохраняем email для последующего входа
         messageApi.success({
            content: 'Ссылка для восстановления отправлена на почту. Перейдите по ней, чтобы установить новый пароль.',
            duration: 10,
         })
         setShowForgotPassword(false)
      } catch (err: any) {
         const localizedMessage = localizeSupabaseError(err.message)
         messageApi.error('Ошибка отправки: ' + localizedMessage)
      } finally {
         setLoading(false)
      }
   }

   const onFinishResetPassword = async (values: { password: string }) => {
      setLoading(true)
      try {
         // Обновляем пароль
         const { error: updateError } = await supabase.auth.updateUser({ password: values.password })
         if (updateError) throw updateError

         // Выполняем вход с новым паролем
         const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email: resetEmail,
            password: values.password,
         })
         if (signInError) throw signInError

         // Если вход успешен, обрабатываем сессию
         if (data.session) {
            handleSignIn(data.session)
            messageApi.success('Пароль успешно изменён. Выполняем вход...')
         }

         setIsResetModalOpen(false)
         form.resetFields(['password']) // очистим поле пароля
      } catch (err: any) {
         const localizedMessage = localizeSupabaseError(err.message)
         messageApi.error('Не удалось сменить пароль: ' + localizedMessage)
      } finally {
         setLoading(false)
      }
   }

   const onFinish = (values: any) => {
      // Honeypot
      const unknownFields = Object.keys(values).filter(
         (key) => !['email', 'password', 'confirm', 'user_name', 'phone', 'prefix'].includes(key),
      )

      for (const key of unknownFields) {
         if (values[key]) return
      }

      // Time check
      const now = Date.now()
      const timeElapsed = now - (submitTime || now)
      if (timeElapsed < 2000) {
         message.warning('Подождите немного перед отправкой формы')
         return
      }

      const resultValues = {
         email: values.email,
         password: values.password,
         user_name: values.user_name,
         phone: values.phone ? '+7' + values.phone : null,
      }
      handleAuth(resultValues)
   }

   const layout: FormProps = {
      colon: false,
      labelAlign: 'left',
      labelCol: { span: 8 },
      wrapperCol: { span: 14 },
   }

   return (
      <div className={s['wrap-login']}>
         {contextHolder}

         {/* Модалка для смены пароля */}
         <Modal title="Установите новый пароль" open={isResetModalOpen} footer={null} maskClosable={false} closable={false}>
            <Form layout="vertical" onFinish={onFinishResetPassword} disabled={loading}>
               <Form.Item
                  label="Новый пароль"
                  name="password"
                  rules={[
                     { required: true, message: 'Введите пароль' },
                     { min: 6, message: 'Пароль должен быть не менее 6 символов' },
                  ]}
               >
                  <Input.Password placeholder="••••••" />
               </Form.Item>

               <Form.Item>
                  <Flex gap="small">
                     <Button type="primary" htmlType="submit" block loading={loading}>
                        Сменить пароль
                     </Button>
                     <Button onClick={() => setIsResetModalOpen(false)} block disabled={loading}>
                        Отмена
                     </Button>
                  </Flex>
               </Form.Item>
            </Form>
         </Modal>

         <div className={s['wrap-login__block']}>
            <div className={s['wrap-login__block-header']}>
               <h2>{isRegistering ? 'Регистрация' : 'Вход'}</h2>
            </div>
            <div className={s['wrap-login__block-auth']}>
               <Form {...layout} form={form} className="login-form" name="auth_form" onFinish={onFinish}>
                  <Form.Item
                     name="email"
                     label="Почта"
                     rules={[
                        { type: 'email', message: 'Введите корректный email' },
                        { required: true, message: 'Введите email' },
                     ]}
                  >
                     <Input placeholder="Email" />
                  </Form.Item>

                  <Form.Item
                     name="password"
                     rules={[{ required: true, message: 'Введите пароль' }]}
                     hasFeedback
                     label="Пароль"
                  >
                     <Input.Password size="large" placeholder="Пароль" minLength={6} />
                  </Form.Item>

                  <Form.Item noStyle name={honeypotName}>
                     <Input type="text" autoComplete="off" style={{ display: 'none' }} />
                  </Form.Item>

                  {isRegistering && (
                     <>
                        <Form.Item
                           name="confirm"
                           dependencies={['password']}
                           hasFeedback
                           label="Подтвердите пароль"
                           rules={[
                              { required: true, message: 'Подтвердите пароль' },
                              ({ getFieldValue }) => ({
                                 validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                       return Promise.resolve()
                                    }
                                    return Promise.reject(new Error('Пароли должны совпадать'))
                                 },
                              }),
                           ]}
                        >
                           <Input.Password placeholder="Подтвердите пароль" minLength={6} />
                        </Form.Item>

                        <Form.Item
                           name="user_name"
                           label="Имя пользователя"
                           rules={[{ required: true, message: 'Введите имя пользователя' }]}
                           extra="Имя, которое будет отображаться в списке игроков"
                        >
                           <Input placeholder="Имя пользователя" />
                        </Form.Item>

                        <Form.Item name="phone" label="Телефон">
                           <InputNumber
                              addonBefore={
                                 <Form.Item name="prefix" noStyle>
                                    +7
                                 </Form.Item>
                              }
                              style={{ width: '100%' }}
                              minLength={10}
                              maxLength={10}
                           />
                        </Form.Item>
                     </>
                  )}

                  {/* Кнопка "Восстановить пароль" */}
                  {showForgotPassword && (
                     <Form.Item wrapperCol={{ ...layout.wrapperCol }} label=" ">
                        <Button
                           type="link"
                           style={{ padding: 0, height: 'auto', fontSize: '14px' }}
                           onClick={() => handleForgotPassword(showForgotPassword)}
                           disabled={loading}
                        >
                           Восстановить пароль
                        </Button>
                     </Form.Item>
                  )}

                  <Form.Item wrapperCol={{ ...layout.wrapperCol }} label=" ">
                     <Button block size="large" type="primary" htmlType="submit" loading={loading}>
                        {isRegistering ? 'Зарегистрироваться' : 'Войти'}
                     </Button>
                  </Form.Item>

                  <Form.Item wrapperCol={{ ...layout.wrapperCol }} label=" ">
                     <Button block size="large" type="primary" onClick={() => setIsRegistering(!isRegistering)}>
                        {isRegistering ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Регистрация'}
                     </Button>
                  </Form.Item>
               </Form>
            </div>
         </div>
      </div>
   )
}

export default LoginPage
