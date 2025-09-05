/* eslint-disable @typescript-eslint/no-unused-vars */
import {
   Avatar,
   Button,
   Col,
   DatePicker,
   Divider,
   Flex,
   Form,
   Image,
   Input,
   Row,
   Select,
   Space,
   Spin,
   Statistic,
   Upload,
   UploadFile,
   UploadProps,
   message,
} from 'antd'
import { StarOutlined, UploadOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { supabase } from '@supabaseDir/supabaseClient'
import { get_avatar_url, upload_avatar } from '@utils/storage'
import dayjs from 'dayjs'

import s from './ProfilePage.module.scss'

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

   const [previewOpen, setPreviewOpen] = useState(false)
   const [previewImage, setPreviewImage] = useState('')
   const [fileList, setFileList] = useState<UploadFile[]>([
      {
         uid: '1',
         name: 'image.png',
         status: 'done',
         url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
      },
   ])

   const [messageApi, contextHolder] = message.useMessage()

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
               const url = get_avatar_url(data.avatar_url)
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

   // Загрузка аватарки
   const handleUpload = async (file: File) => {
      if (!internalUserId) {
         messageApi.error('Невозможно загрузить аватар: пользователь не определён')
         return
      }

      setLoading(true)
      try {
         const filePath = await upload_avatar(file, internalUserId.toString())

         if (filePath) {
            const url = get_avatar_url(filePath)
            setImageUrl(url)

            await supabase.from('users').update({ avatar_url: filePath }).eq('id', internalUserId)
            messageApi.success('Аватар обновлён')
         }
      } catch (error: any) {
         messageApi.error('Ошибка загрузки аватара: ' + error.message)
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
         span: 3,
      },
      wrapperCol: {
         span: 6,
      },
   }

   const handlePreview = async (file: UploadFile) => {
      if (!file.url && !file.preview) {
         file.preview = await getBase64(file.originFileObj as FileType)
      }

      setPreviewImage(file.url || (file.preview as string))
      setPreviewOpen(true)
   }

   const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => setFileList(newFileList)

   const ampluaListOptions = [
      {
         value: 'Универсал',
         label: 'Универсал',
      },
      {
         value: 'Нападающий',
         label: 'Нападающий',
      },
      {
         value: 'Защитник',
         label: 'Защитник',
      },
      {
         value: 'Вратарь',
         label: 'Вратарь',
      },
      {
         value: 'Полузащитник',
         label: 'Полузащитник',
      },
      {
         value: 'Центральный',
         label: 'Центральный',
      },
   ]

   const skillListOptions = [
      {
         value: 'Новичок',
         label: 'Новичок',
      },
      {
         value: 'Начинающий',
         label: 'Начинающий',
      },
      {
         value: 'Любитель',
         label: 'Любитель',
      },
      {
         value: 'Опытный любитель',
         label: 'Опытный любитель',
      },
      {
         value: 'Полупрофи',
         label: 'Полупрофи',
      },
      {
         value: 'Профи',
         label: 'Профи',
      },
   ]

   const initialValues = {
      user_name: '',
      email: '',
      first_name: '',
      last_name: '',
      user_phone: '',
      position: 'Универсал',
      skill_level: 'Любитель',
      birth_year: null,
   }

   return (
      <div className={s.ProfileWrap}>
         {contextHolder}
         <h3 style={{ margin: '0 0 16px 0' }}>Профиль пользователя</h3>
         <Spin spinning={loading}>
            <Form form={form} {...layout} labelAlign="left" onFinish={onFinish} initialValues={initialValues}>
               <Row gutter={24} style={{ marginTop: '64px' }}>
                  <Col span={4}>
                     <Flex vertical gap={16} style={{ marginLeft: '16px' }}>
                        <div>
                           <Upload
                              action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                              listType="picture-circle"
                              // listType="picture-card"
                              fileList={fileList}
                              onPreview={handlePreview}
                              onChange={handleChange}
                           >
                              {fileList.length >= 1 ? null : uploadButton}
                           </Upload>
                           {previewImage && (
                              <Image
                                 wrapperStyle={{ display: 'none' }}
                                 preview={{
                                    visible: previewOpen,
                                    onVisibleChange: (visible) => setPreviewOpen(visible),
                                    afterOpenChange: (visible) => !visible && setPreviewImage(''),
                                 }}
                                 src={previewImage}
                              />
                           )}
                        </div>
                        <Space size="large">
                           <Statistic title="Игр" value={3} />
                           <Statistic title="Рейтинг" value={4} suffix={<StarOutlined />} />
                        </Space>
                     </Flex>
                  </Col>
                  <Col span={20}>
                     <Item name="user_name" label="Логин" rules={[{ required: true, message: 'Введите логин' }]}>
                        <Input placeholder="Введите логин" />
                     </Item>

                     <Item
                        name="email"
                        label="Email"
                        rules={[{ required: true, type: 'email', message: 'Некорректный формат email' }]}
                     >
                        <Input placeholder="email@example.com" />
                     </Item>

                     <Item
                        name="user_phone"
                        label="Телефон"
                        rules={[
                           {
                              pattern: /^\+?7\d{10,11}$/,
                              message: 'Некорректный номер',
                           },
                        ]}
                     >
                        <Input placeholder="Введите номер телефона" />
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
                        <Select options={ampluaListOptions} />
                     </Item>

                     <Item name="skill_level" label="Уровень игры">
                        <Select options={skillListOptions} />
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
