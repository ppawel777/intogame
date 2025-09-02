import { Form, Modal, message } from 'antd'
import FormComponent from './FormComponent'
import { supabase } from '@supabaseDir/supabaseClient'
import { useState } from 'react'
import { GameFormValuesType } from '@typesDir/gameTypes'

type Props = {
   onClose: () => void
   onSuccess?: () => void
}

const ModalCreateGame = ({ onClose, onSuccess }: Props) => {
   const [form] = Form.useForm()
   const [loading, setLoading] = useState(false)

   const handleCreate = async (values: GameFormValuesType) => {
      setLoading(true)
      try {
         const { error } = await supabase.from('games').insert([values])

         if (error) throw error

         message.success('Игра успешно создана')
         form.resetFields()
         onSuccess?.()
         onClose()
      } catch (error: any) {
         console.error('Ошибка создания игры:', error)
         message.error(error.message || 'Не удалось создать игру')
      } finally {
         setLoading(false)
      }
   }

   const handleSubmit = () => {
      form
         .validateFields()
         .then(handleCreate)
         .catch((errorInfo) => {
            // Показываем первую ошибку
            const firstError = errorInfo.errorFields[0]
            if (firstError) {
               message.error({
                  content: `${firstError.name.join('.')}: ${firstError.errors[0]}`,
                  duration: 6,
               })
            }
         })
   }

   const initialValues = {
      place_id: null,
      game_date: null,
      game_time: null,
      game_price: null,
      players_limit: null,
   }

   return (
      <Modal
         title="Создать игру"
         open
         onOk={handleSubmit}
         okButtonProps={{ loading }}
         onCancel={onClose}
         okText="Создать"
         cancelText="Отмена"
         width="80vw"
         style={{ top: 20 }}
         // destroyOnClose
         maskClosable={false}
      >
         <FormComponent form={form} initialValues={initialValues} isCreate={true} />
      </Modal>
   )
}

export default ModalCreateGame
