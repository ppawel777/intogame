/* eslint-disable @typescript-eslint/no-unused-vars */
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { useAuth } from '@context/providers/AuthProvider/AuthProvider'
import { set_cookie } from '@utils/auth'
import { Button, Form, Input } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'

import logo from '@svg/logo_gims_auth.svg'

import './index.scss'

const Login = () => {
   const navigate = useNavigate()
   const location = useLocation()
   const { signin } = useAuth()

   const from = location.state?.from || '/'

   const layout = {
      colon: false,
      labelCol: {
         span: 8,
      },
      wrapperCol: {
         span: 24,
      },
   }

   const tailLayout = {
      wrapperCol: {
         span: 24,
      },
   }

   const handleSignIn = (data: { access: string; refresh: string }, remember: boolean = false) => {
      const { access, refresh } = data

      signin(() => {
         set_cookie({ name: 'access_token', value: access })
         set_cookie({ name: 'refresh_token', value: refresh, isRemember: remember }) // 30 days
         navigate(from, {
            replace: true,
         })
      })
   }

   const onFinish = async (values: any) => {
      console.log('values', values)
      // const data = await getGWTToken(values)
      // data && handleSignIn(data, values.remember)
   }

   return (
      <div className="wrap-login">
         <div className="wrap-login__block">
            <div className="wrap-login__block-header">
               <img src={logo} alt="logo" />
               <h2>GIMS</h2>
            </div>
            <div className="wrap-login__block-auth">
               <Form
                  {...layout}
                  labelAlign="left"
                  className="login-form"
                  name="auth_login"
                  onFinish={onFinish}
                  requiredMark={false}
                  initialValues={{ remember: true }}
               >
                  <Form.Item name="username" rules={[{ required: true, message: 'Введите имя пользователя' }]}>
                     <Input className="input-req" size="large" placeholder="Имя пользователя" prefix={<UserOutlined />} />
                  </Form.Item>
                  <Form.Item name="password" rules={[{ required: true, message: 'Введите пароль пользователя' }]}>
                     <Input.Password className="input-req" size="large" placeholder="Пароль" prefix={<LockOutlined />} />
                  </Form.Item>
                  <Form.Item {...tailLayout}>
                     <Button
                        className="input-req wrap-login__submit-btn"
                        block
                        size="large"
                        type="primary"
                        htmlType="submit"
                     >
                        Войти
                     </Button>
                  </Form.Item>
               </Form>
            </div>
         </div>
      </div>
   )
}

export default Login
