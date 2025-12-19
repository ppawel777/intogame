import { Form, Modal, message } from 'antd'
import FormComponent from '../components/FormComponent/FormComponent'
import { supabase } from '@supabaseDir/supabaseClient'
import { useState } from 'react'
import { GameFormValuesType } from '@typesDir/gameTypes'
import { useUserId } from '@utils/hooks/useUserId'
import { useIsMobile } from '@utils/hooks/useIsMobile'

type Props = {
   onClose: () => void
   onSuccess?: () => void
}

const ModalCreateGame = ({ onClose, onSuccess }: Props) => {
   const [form] = Form.useForm()
   const [loading, setLoading] = useState(false)
   const { userId } = useUserId()
   const isMobile = useIsMobile()

   const handleCreate = async (values: GameFormValuesType) => {
      if (!userId) {
         message.error('Необходимо авторизоваться для создания игры')
         return
      }

      setLoading(true)
      try {
         const gameData = {
            ...values,
            game_status: values.game_status || 'Активна',
            creator_id: userId,
         }

         const { error } = await supabase.from('games').insert([gameData])

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
         width={isMobile ? '100%' : '80vw'}
         style={isMobile ? { top: 0, paddingBottom: 0 } : { top: 20 }}
         styles={{ body: { maxHeight: isMobile ? 'calc(100vh - 120px)' : 'auto', overflowY: 'auto' } }}
         // destroyOnClose
         maskClosable={false}
      >
         <FormComponent form={form} initialValues={initialValues} isCreate={true} />
      </Modal>
   )
}

export default ModalCreateGame
