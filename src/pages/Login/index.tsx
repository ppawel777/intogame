import { useState } from 'react'
import { Button, Form, FormProps, Input, InputNumber, message } from 'antd'
// import HCaptcha from '@hcaptcha/react-hcaptcha'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@context/providers/AuthProvider/AuthProvider'
import { Session } from '@supabase/supabase-js'
import { useSignInWithPassword, useSignUp } from '@hooks/auth/useSupabaseAuth'
import { SessionAuth } from '@typesDir/userTypes'

import './index.scss'
import { useInsertUser } from '@hooks/users/useUserQuery'

const Login = () => {
   const navigate = useNavigate()
   const location = useLocation()
   const { signin } = useAuth()

   const [form] = Form.useForm()
   const [isRegistering, setIsRegistering] = useState(false)
   const [loading, setLoading] = useState(false)

   const from = location.state?.from || '/'

   const handleSignIn = (session: Session, id: any) => {
      const { access_token, refresh_token } = session
      const dataSet: SessionAuth = {
         access_token,
         refresh_token,
         user_id: id,
      }
      signin(dataSet, () => {
         navigate(from, { replace: true })
      })
   }

   const handleAuth = async (values: any) => {
      const { email, password, user_name, phone } = values
      setLoading(true)
      try {
         if (isRegistering) {
            const { data: authData, error } = await useSignUp(email, password, user_name, phone)

            if (error) throw error

            const { session, user } = authData
            const { error: publicError } = await useInsertUser(user?.id, email, user_name, phone)

            if (publicError) throw publicError

            session && handleSignIn(session, user?.id)
         } else {
            const { data, error } = await useSignInWithPassword(email, password)
            if (error) throw error

            data.session && handleSignIn(data.session, data.user?.id)
         }
      } catch (err: any) {
         if (err.code === 'invalid_credentials') message.error('Неправильные email или пароль')
         else message.error(err.message)
      } finally {
         setLoading(false)
      }
   }

   const onFinish = (values: any) => {
      const resultValues = {
         email: values.email,
         password: values.password,
         user_name: values.user_name,
         phone: '+7' + values.phone,
      }
      handleAuth(resultValues)
   }

   const layout: FormProps = {
      colon: false,
      labelAlign: 'left',
      labelCol: {
         span: 8,
      },
      wrapperCol: {
         span: 14,
      },
   }

   return (
      <div className="wrap-login">
         <div className="wrap-login__block">
            <div className="wrap-login__block-header">
               <h2>{isRegistering ? 'Регистрация' : 'Вход'}</h2>
            </div>
            <div className="wrap-login__block-auth">
               <Form {...layout} form={form} className="login-form" name="auth_form" onFinish={onFinish}>
                  <Form.Item
                     name="email"
                     label="Почта"
                     rules={[
                        {
                           type: 'email',
                           message: 'Введите коррректный email',
                        },
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
                                    return Promise.reject('Пароли должны совпадать')
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
                  {/* <HCaptcha
                     sitekey="ES_92f2697a832a46b993db247ba5307458"
                     onVerify={(token, ekey) => handleVerificationSuccess(token, ekey)}
                  /> */}
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

export default Login
