/* eslint-disable max-len */
import { useState } from 'react'
import { Button, Flex, Form, FormProps, Input, Steps, message } from 'antd'
import { CheckCircleOutlined, SafetyOutlined, UserOutlined } from '@ant-design/icons'
import { supabase } from '@supabaseDir/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@context/providers/AuthProvider/AuthProvider'
import { set_cookie } from '@utils/auth'
import { localizeSupabaseError } from '@utils/authErrors'

import s from './RegisterPage.module.scss'
import { useIsMobile } from '@utils/hooks/useIsMobile'

const RegisterPage = () => {
   const navigate = useNavigate()
   const { signin } = useAuth()
   const isMobile = useIsMobile()
   const [messageApi, contextHolder] = message.useMessage()
   const [form] = Form.useForm()

   const [currentStep, setCurrentStep] = useState(0)
   const [loading, setLoading] = useState(false)
   const [resending, setResending] = useState(false)
   const [registrationData, setRegistrationData] = useState<{
      email: string
      password: string
      user_name: string
      phone: string | null
   } | null>(null)

   const [honeypotName] = useState('custom_field_' + Math.random().toString(36).substr(2, 9))
   const [submitTime] = useState<number>(Date.now())

   const layout: FormProps = {
      colon: false,
      labelAlign: 'left',
      labelCol: { span: isMobile ? 24 : 6 },
      wrapperCol: { span: isMobile ? 24 : 14 },
   }

   // Шаг 1: Регистрация
   const handleRegister = async (values: any) => {
      // Honeypot
      const unknownFields = Object.keys(values).filter(
         (key) => !['email', 'password', 'confirm', 'user_name', 'phone', 'prefix'].includes(key),
      )

      for (const key of unknownFields) {
         if (values[key]) return
      }

      // Time check
      const now = Date.now()
      const timeElapsed = now - submitTime
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

      setLoading(true)
      try {
         const { error } = await supabase.auth.signUp({
            email: resultValues.email,
            password: resultValues.password,
            options: {
               data: {
                  user_name: resultValues.user_name,
                  user_phone: resultValues.phone,
               },
            },
         })

         if (error) throw error

         setRegistrationData(resultValues)
         messageApi.success('Код подтверждения отправлен на вашу почту')
         setCurrentStep(1)
      } catch (error: any) {
         const localizedMessage = localizeSupabaseError(error.message)
         messageApi.error(localizedMessage)
      } finally {
         setLoading(false)
      }
   }

   // Шаг 2: Подтверждение кода
   const handleVerifyCode = async (values: { code: string }) => {
      if (!registrationData?.email) {
         messageApi.error('Email не найден')
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
               email: registrationData.email,
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

         // Сохраняем токены в cookies
         set_cookie({ name: 'access_token', value: access_token })
         set_cookie({ name: 'refresh_token', value: refresh_token })

         messageApi.success('Email успешно подтверждён!')
         setCurrentStep(2)
      } catch (err: any) {
         const localizedMessage = localizeSupabaseError(err.message)
         messageApi.error('Неверный код: ' + localizedMessage)
      } finally {
         setLoading(false)
      }
   }

   const handleResendCode = async () => {
      if (!registrationData?.email) {
         messageApi.error('Email не найден')
         return
      }

      setResending(true)
      try {
         const { error } = await supabase.auth.resend({
            type: 'signup',
            email: registrationData.email,
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

   // Шаг 3: Вход
   const handleLogin = () => {
      signin(() => {
         navigate('/', { replace: true })
      })
   }

   const steps = [
      {
         title: 'Данные',
         icon: <UserOutlined />,
      },
      {
         title: 'Подтверждение',
         icon: <SafetyOutlined />,
      },
      {
         title: 'Готово',
         icon: <CheckCircleOutlined />,
      },
   ]

   return (
      <div className={s['wrap-register']}>
         {contextHolder}
         <div className={s['wrap-register__block']}>
            <div className={s['wrap-register__block-header']}>
               <h2>Регистрация</h2>
            </div>

            <Steps
               current={currentStep}
               items={steps}
               style={{ marginBottom: '32px' }}
               direction={isMobile ? 'vertical' : 'horizontal'}
               size={isMobile ? 'small' : 'default'}
            />

            <div className={s['wrap-register__block-content']}>
               {/* Шаг 1: Форма регистрации */}
               {currentStep === 0 && (
                  <Form form={form} name="register_form" onFinish={handleRegister} layout="vertical" requiredMark={false}>
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
                        label="Пароль"
                        rules={[
                           { required: true, message: 'Введите пароль' },
                           { min: 6, message: 'Пароль должен быть не менее 6 символов' },
                        ]}
                        hasFeedback
                     >
                        <Input.Password placeholder="Пароль" minLength={6} />
                     </Form.Item>

                     <Form.Item
                        name="confirm"
                        label="Подтвердите пароль"
                        dependencies={['password']}
                        hasFeedback
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

                     {/* <Form.Item name="phone" label="Телефон">
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
                     </Form.Item> */}

                     <Form.Item noStyle name={honeypotName}>
                        <Input type="text" autoComplete="off" style={{ display: 'none' }} />
                     </Form.Item>

                     <Form.Item>
                        <Flex vertical gap="small">
                           <Button block size="large" type="primary" htmlType="submit" loading={loading}>
                              Получить код
                           </Button>
                           <Button block size="large" onClick={() => navigate('/login')}>
                              Уже есть аккаунт? Войти
                           </Button>
                        </Flex>
                     </Form.Item>
                  </Form>
               )}

               {/* Шаг 2: Ввод кода подтверждения */}
               {currentStep === 1 && (
                  <>
                     <p>
                        Введите код подтверждения, отправленный на <strong>{registrationData?.email}</strong>
                     </p>
                     <Form {...layout} name="confirm_form" onFinish={handleVerifyCode} requiredMark={false}>
                        <Form.Item
                           name="code"
                           label="Код подтверждения"
                           rules={[{ required: true, message: 'Введите код подтверждения' }]}
                        >
                           <Input placeholder="Введите код из письма" maxLength={6} />
                        </Form.Item>

                        <Form.Item>
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
                  </>
               )}

               {/* Шаг 3: Успешная регистрация */}
               {currentStep === 2 && (
                  <div style={{ textAlign: 'center' }}>
                     <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: '24px' }} />
                     <h3 style={{ marginBottom: '16px' }}>Регистрация успешно завершена!</h3>
                     <p style={{ marginBottom: '32px' }}>Ваш аккаунт подтверждён. Теперь вы можете войти в систему.</p>
                     <Button block size="large" type="primary" onClick={handleLogin}>
                        Войти
                     </Button>
                  </div>
               )}
            </div>
         </div>
      </div>
   )
}

export default RegisterPage
