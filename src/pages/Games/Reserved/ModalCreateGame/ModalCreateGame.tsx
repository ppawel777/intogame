import { Form, Modal, message } from 'antd'
import FormComponent from './FormComponent'
import dayjs from 'dayjs'
import { supabase } from '@supabaseDir/supabaseClient'

type Props = {
   handleChangeVisibleModal: (visible: boolean) => void
   setChangeGame: React.Dispatch<React.SetStateAction<boolean>>
}

const ModalCreateGame = ({ handleChangeVisibleModal, setChangeGame }: Props) => {
   const [form] = Form.useForm()

   const addGameFetch = async (values: any) => {
      try {
         const { data, error } = await supabase.from('games').insert([values]).select() // возвращает вставленные данные

         if (error) throw error
         data && message.success('Игра добавлена')
         setChangeGame(true)
         handleChangeVisibleModal(false)
      } catch (error: any) {
         message.error(error.message)
      }
   }

   const addGameFunction = () => {
      form.submit()
      form
         .validateFields()
         .then((values) => {
            values.game_date = dayjs(values.game_date).format('YYYY-MM-DD')
            const time_arr = values.game_time.map((item: any) => dayjs(item).format('HH:mm'))
            values.game_time = time_arr.join(' - ')
            // console.log('values', values)
            addGameFetch(values)
         })
         .catch((errorList) => {
            errorList.errorFields.forEach((item: { name: string[]; errors: string[] }) => {
               message.error({ content: item.name[0] + ': ' + item.errors[0], duration: 6 })
            })
         })
   }

   return (
      <Modal
         title="Создать игру"
         open
         destroyOnClose
         maskClosable={false}
         onOk={addGameFunction}
         okText="Создать"
         onCancel={() => handleChangeVisibleModal(false)}
         cancelText="Закрыть"
         width="80vw"
         style={{ top: 20 }}
         className="modal-box-custom_with-footer"
      >
         <FormComponent form={form} />
      </Modal>
   )
}

export default ModalCreateGame
