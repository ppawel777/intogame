import {
   Button,
   Col,
   DatePicker,
   Divider,
   Flex,
   Form,
   Image,
   Input,
   InputNumber,
   Row,
   Select,
   Space,
   Spin,
   Statistic,
   Upload,
   UploadProps,
   message,
} from 'antd'
import ImgCrop from 'antd-img-crop'
import { StarOutlined, UploadOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { supabase } from '@supabaseDir/supabaseClient'
import { delete_avatar, get_avatar_url, upload_avatar } from '@utils/storage'
import dayjs from 'dayjs'

import s from './ProfilePage.module.scss'
import { useIsMobile } from '@utils/hooks/useIsMobile'

const { Item } = Form

type FormData = {
   user_name: string
   first_name: string
   last_name: string
   user_phone: string
   email: string
   skill_level: string
   position: string
   birth_year: number
}

const ProfilePage = () => {
   const [form] = Form.useForm<FormData>()
   const [loading, setLoading] = useState(false)
   const [imageUrl, setImageUrl] = useState<string | null>(null)
   const isMobile = useIsMobile()

   const [previewOpen, setPreviewOpen] = useState(false)
   // const [previewImage, setPreviewImage] = useState('')
   // Убрали fileList — управляем через imageUrl

   const [messageApi, contextHolder] = message.useMessage()

   // UUID пользователя
   const [authUserId, setAuthUserId] = useState<string | null>(null)
   // Внутренний ID пользователя из таблицы public.users
   const [internalUserId, setInternalUserId] = useState<number | null>(null)

   // Загрузка профиля через сессию
   useEffect(() => {
      const fetchUserProfile = async () => {
         setLoading(true)
         try {
            // Получаем сессию
            const {
               data: { session },
               error: authError,
            } = await supabase.auth.getSession()
            if (authError) throw authError
            if (!session) throw new Error('Пользователь не авторизован')

            const authUserId = session.user.id // UUID из auth.users
            setAuthUserId(authUserId)

            // Находим пользователя в таблице public.users
            const { data, error: userError } = await supabase.from('users').select('*').eq('uuid', authUserId).single()

            if (userError) throw userError

            setInternalUserId(data.id)

            form.setFieldsValue({
               user_name: data.user_name || '',
               email: data.email || '',
               first_name: data.first_name || '',
               last_name: data.last_name || '',
               user_phone: data.user_phone || '',
               position: data.position,
               birth_year: data.birth_year || null,
               skill_level: data.skill_level,
            })

            // Загружаем аватар
            if (data.avatar_url) {
               const url = await get_avatar_url(data.avatar_url)
               setImageUrl(url)
            }
         } catch (error: any) {
            messageApi.error('Не удалось загрузить профиль: ' + error.message)
         } finally {
            setLoading(false)
         }
      }

      fetchUserProfile()
   }, [])

   const onFinish = async (values: FormData) => {
      if (!internalUserId) {
         messageApi.error('Неизвестный пользователь')
         return
      }

      setLoading(true)
      try {
         const { error } = await supabase
            .from('users')
            .update({
               user_name: values.user_name,
               first_name: values.first_name,
               last_name: values.last_name,
               user_phone: values.user_phone,
               email: values.email,
               position: values.position,
               birth_year: values.birth_year,
               skill_level: values.skill_level,
               update_at: new Date().toISOString(),
            })
            .eq('id', internalUserId)

         if (error) throw error

         messageApi.success('Профиль успешно обновлён')
      } catch (error: any) {
         console.error('Ошибка обновления профиля:', error)
         messageApi.error('Ошибка сохранения: ' + error.message)
      } finally {
         setLoading(false)
      }
   }

   const uploadButton = (
      <div>
         <UploadOutlined />
         <div style={{ marginTop: 4 }}>Загрузить</div>
      </div>
   )

   const layout = {
      colon: false,
      labelCol: {
         span: isMobile ? 24 : 3,
      },
      wrapperCol: {
         span: isMobile ? 24 : 6,
      },
   }

   const uploadProps: UploadProps = {
      listType: 'picture-circle',
      showUploadList: false,
      style: { width: 100, height: 100 },
      beforeUpload: (file) => {
         const isImage = file.type.startsWith('image/')
         if (!isImage) {
            messageApi.error('Можно загружать только изображения!')
            return Upload.LIST_IGNORE
         }
         return true
      },
      customRequest: async ({ file, onSuccess, onError }) => {
         try {
            if (!internalUserId) throw new Error('Пользователь не авторизован')
            if (!authUserId) {
               messageApi.error('Неизвестный пользователь (authUserId отсутствует)')
               return onError?.(new Error('authUserId is null'))
            }

            const filePath = await upload_avatar(file as File, authUserId)
            if (filePath) {
               const url = await get_avatar_url(filePath)
               setImageUrl(url)
               await supabase.from('users').update({ avatar_url: filePath }).eq('id', internalUserId)
               messageApi.success('Аватар обновлён')
               onSuccess?.({}, file as any)
            }
         } catch (error: any) {
            onError?.(error)
            messageApi.error('Ошибка загрузки аватара: ' + error.message)
         }
      },
   }

   return (
      <div className={s.ProfileWrap}>
         {contextHolder}
         <h3 style={{ margin: '0 0 16px 0' }}>Профиль пользователя</h3>
         <Spin spinning={loading}>
            <Form form={form} {...layout} labelAlign="left" onFinish={onFinish}>
               <Row gutter={[24, 24]} style={{ marginTop: '64px' }}>
                  <Col xs={24} sm={24} md={4}>
                     <Flex
                        vertical
                        gap={16}
                        style={{ marginLeft: isMobile ? 0 : '16px' }}
                        align={isMobile ? 'center' : 'start'}
                     >
                        <div>
                           <Flex vertical gap={8} align="center">
                              <ImgCrop rotationSlider cropShape="round" showGrid={false}>
                                 <Upload {...uploadProps}>
                                    {imageUrl ? (
                                       <Image
                                          src={imageUrl}
                                          alt="avatar"
                                          style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                                          preview={false}
                                       />
                                    ) : (
                                       uploadButton
                                    )}
                                 </Upload>
                              </ImgCrop>
                              {imageUrl && (
                                 <Button
                                    danger
                                    size="small"
                                    onClick={async () => {
                                       try {
                                          if (!authUserId) throw new Error('Пользователь не авторизован')
                                          await delete_avatar(authUserId)
                                          setImageUrl(null)
                                          messageApi.success('Фото удалено')
                                       } catch (error: any) {
                                          messageApi.error('Ошибка удаления: ' + error.message)
                                       }
                                    }}
                                 >
                                    Удалить фото
                                 </Button>
                              )}
                           </Flex>

                           <Image
                              style={{ display: 'none' }}
                              preview={{
                                 visible: previewOpen,
                                 onVisibleChange: (visible) => setPreviewOpen(visible),
                                 // src: previewImage,
                              }}
                           />
                        </div>
                        <Space size="large">
                           <Statistic title="Игр" value={3} />
                           <Statistic title="Рейтинг" value={4} suffix={<StarOutlined />} />
                        </Space>
                     </Flex>
                  </Col>
                  <Col xs={24} sm={24} md={20}>
                     {/* Остальная форма — без изменений */}
                     <Item name="user_name" label="Логин" rules={[{ required: true, message: 'Введите логин' }]}>
                        <Input placeholder="Введите логин" />
                     </Item>

                     <Item
                        name="email"
                        label="Почта"
                        rules={[
                           { type: 'email', message: 'Введите корректный email' },
                           { required: true, message: 'Введите email' },
                        ]}
                     >
                        <Input />
                     </Item>

                     <Item name="user_phone" label="Телефон">
                        <InputNumber
                           addonBefore={
                              <Item name="prefix" noStyle>
                                 +7
                              </Item>
                           }
                           style={{ width: '100%' }}
                           minLength={10}
                           maxLength={10}
                        />
                     </Item>
                     <Divider />
                     <Item
                        name="first_name"
                        label="Имя"
                        rules={[
                           {
                              pattern: /^[а-яА-ЯёЁa-zA-Z]+$/,
                              message: 'Только буквы, без пробелов и дефисов',
                           },
                        ]}
                     >
                        <Input placeholder="Введите имя" />
                     </Item>

                     <Item
                        name="last_name"
                        label="Фамилия"
                        rules={[
                           {
                              pattern: /^[а-яА-ЯёЁa-zA-Z]+$/,
                              message: 'Только буквы, без пробелов и дефисов',
                           },
                        ]}
                     >
                        <Input placeholder="Введите фамилию" />
                     </Item>
                     <Item
                        name="birth_year"
                        label="Год рождения"
                        getValueFromEvent={(date) => (date ? date.year() : null)}
                        getValueProps={(value) => ({
                           value: value ? dayjs(value.toString()) : null,
                        })}
                     >
                        <DatePicker
                           picker="year"
                           style={{ width: '100%' }}
                           disabledDate={(current) => {
                              if (!current) return false
                              const currentYear = dayjs().year()
                              const minYear = currentYear - 65
                              return current.year() < minYear || current.year() > currentYear
                           }}
                        />
                     </Item>

                     <Item name="position" label="Основное амплуа">
                        <Select
                           options={[
                              { value: 'Универсал', label: 'Универсал' },
                              { value: 'Нападающий', label: 'Нападающий' },
                              { value: 'Защитник', label: 'Защитник' },
                              { value: 'Вратарь', label: 'Вратарь' },
                              { value: 'Полузащитник', label: 'Полузащитник' },
                              { value: 'Центральный', label: 'Центральный' },
                           ]}
                        />
                     </Item>

                     <Item name="skill_level" label="Уровень игры">
                        <Select
                           options={[
                              { value: 'Не указано', label: 'Не указано' },
                              { value: 'Новичок', label: 'Новичок' },
                              { value: 'Начинающий', label: 'Начинающий' },
                              { value: 'Любитель', label: 'Любитель' },
                              { value: 'Опытный любитель', label: 'Опытный любитель' },
                              { value: 'Полупрофи', label: 'Полупрофи' },
                              { value: 'Профи', label: 'Профи' },
                           ]}
                        />
                     </Item>

                     <Button type="primary" htmlType="submit">
                        Сохранить
                     </Button>
                  </Col>
               </Row>
            </Form>
         </Spin>
      </div>
   )
}

export default ProfilePage
