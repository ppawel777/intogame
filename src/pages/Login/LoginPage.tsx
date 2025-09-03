import { useState } from 'react'
import { Button, Form, FormProps, Input, InputNumber, message } from 'antd'
import { supabase } from '@supabaseDir/supabaseClient'
// import HCaptcha from '@hcaptcha/react-hcaptcha'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@context/providers/AuthProvider/AuthProvider'
import { set_cookie } from '@utils/auth'
import { Session } from '@supabase/supabase-js'

import './index.scss'

const LoginPage = () => {
   const navigate = useNavigate()
   const location = useLocation()
   const { signin } = useAuth()

   const [form] = Form.useForm()
   const [isRegistering, setIsRegistering] = useState(false)
   const [loading, setLoading] = useState(false)

   const from = location.state?.from || '/'

   const handleSignIn = (session: Session) => {
      const { access_token, refresh_token } = session

      signin(() => {
         set_cookie({ name: 'access_token', value: access_token })
         set_cookie({ name: 'refresh_token', value: refresh_token })
         // set_cookie({ name: 'user_id', value: id })
         navigate(from, {
            replace: true,
         })
      })
   }

   const handleAuth = async (values: any) => {
      setLoading(true)
      try {
         if (isRegistering) {
            // const { data, error } = await supabase.rpc('register_user', {
            //    email: values.email,
            //    password: values.password,
            //    user_data: {
            //       user_name: values.user_name,
            //       phone: values.phone,
            //    },
            // })
            const { data: authData, error } = await supabase.auth.signUp({
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
            const { error: publicError } = await supabase.from('users').insert({
               uuid: authData.user?.id,
               email: values.email,
               user_name: values.user_name,
               user_phone: values.phone,
            })

            if (publicError) throw publicError
            // console.log('authData', authData)
            authData.session && handleSignIn(authData.session)
         } else {
            const { data, error } = await supabase.auth.signInWithPassword({
               email: values.email,
               password: values.password,
            })
            if (error) throw error
            // console.log('data', data)
            data.session && handleSignIn(data.session)
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

   // const handleVerificationSuccess = (token, ekey) => {
   //    console.log('token', token)
   //    console.log('ekey', ekey)
   // }

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

export default LoginPage
