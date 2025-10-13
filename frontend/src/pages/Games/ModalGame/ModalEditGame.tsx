import { Form, Modal, message } from 'antd'
import FormComponent from '../components/FormComponent/FormComponent'
import dayjs from 'dayjs'
import { supabase } from '@supabaseDir/supabaseClient'
import { useEffect, useState } from 'react'

// Типы
interface GameFormValues {
   place_id: number
   game_date: string
   game_time: [string, string]
   game_price: number
   players_limit: number
   players_min: number
   is_active: boolean
   game_status: 'Активна' | 'Завершена' | 'Отменена' | 'Перенесена'
   additional_notes: string
}

type Props = {
   id: number
   onClose: () => void
   onSuccess?: () => void
}

const ModalEditGame = ({ id, onClose, onSuccess }: Props) => {
   const [form] = Form.useForm()
   const [loading, setLoading] = useState(false)

   // Получаем данные игры напрямую из БД (лучше, чем передавать gamesData)
   const [initialValues, setInitialValues] = useState<GameFormValues | null>(null)
   const [loadingData, setLoadingData] = useState(true)

   useEffect(() => {
      if (!open || !id) return

      const fetchGame = async () => {
         setLoadingData(true)
         try {
            const { data, error } = await supabase.from('games').select('*').eq('id', id).single()

            if (error) throw error

            const [startTime, endTime] = data.game_time

            setInitialValues({
               place_id: data.place_id,
               game_date: data.game_date,
               game_time: [startTime, endTime],
               game_price: data.game_price,
               players_min: data.players_min,
               players_limit: data.players_limit,
               is_active: data.is_active,
               game_status: data.game_status,
               additional_notes: data.additional_notes,
            })

            // Заполняем форму
            form.setFieldsValue({
               place_id: data.place_id,
               game_date: dayjs(data.game_date),
               game_time: [dayjs(startTime), dayjs(endTime)],
               game_price: data.game_price,
               players_limit: data.players_limit,
               players_min: data.players_min,
               is_active: data.is_active,
               additional_notes: data.additional_notes,
               game_status: data.game_status,
            })
         } catch (error: any) {
            console.error('Ошибка загрузки игры:', error)
            message.error('Не удалось загрузить данные игры')
            onClose()
         } finally {
            setLoadingData(false)
         }
      }

      fetchGame()
   }, [id, open, form])

   const handleUpdate = async (values: GameFormValues) => {
      setLoading(true)
      try {
         const { ...updateData } = values

         const { error } = await supabase.from('games').update(updateData).eq('id', id)

         if (error) throw error

         message.success('Игра обновлена')
         form.resetFields()
         onSuccess?.()
         onClose()
      } catch (error: any) {
         console.error('Ошибка обновления игры:', error)
         message.error(error.message || 'Не удалось обновить игру')
      } finally {
         setLoading(false)
      }
   }

   const handleSubmit = () => {
      form
         .validateFields()
         .then(handleUpdate)
         .catch((errorInfo) => {
            const firstError = errorInfo.errorFields?.[0]
            if (firstError) {
               message.error({
                  content: `${firstError.name.join('.')}: ${firstError.errors[0]}`,
                  duration: 6,
               })
            }
         })
   }

   return (
      <Modal
         title="Редактировать игру"
         open
         // open={open}
         onOk={handleSubmit}
         okButtonProps={{ loading }}
         onCancel={onClose}
         okText="Сохранить"
         cancelText="Отмена"
         width="80vw"
         style={{ top: 20 }}
         // destroyOnClose
         maskClosable={false}
         confirmLoading={loadingData}
      >
         {loadingData ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>Загрузка данных...</div>
         ) : (
            <FormComponent form={form} initialValues={initialValues} />
         )}
      </Modal>
   )
}

export default ModalEditGame
