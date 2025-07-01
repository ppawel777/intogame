import { Form, Modal, message } from 'antd'
import FormComponent from './FormComponent'
import { useInsertGame } from '@hooks/games/useSupabaseGames'

type Props = {
   handleChangeVisibleModal: (visible: boolean) => void
   setChangeGame: React.Dispatch<React.SetStateAction<boolean>>
}

const ModalCreateGame = ({ handleChangeVisibleModal, setChangeGame }: Props) => {
   const [form] = Form.useForm()

   const addGameFetch = async (values: any) => {
      try {
         const { data, error } = await useInsertGame(values)

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
            addGameFetch(values)
         })
         .catch((errorList) => {
            errorList.errorFields.forEach((item: { name: string[]; errors: string[] }) => {
               message.error({ content: item.name[0] + ': ' + item.errors[0], duration: 6 })
            })
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
         maskClosable={false}
         onOk={addGameFunction}
         okText="Создать"
         onCancel={() => handleChangeVisibleModal(false)}
         cancelText="Закрыть"
         width="80vw"
         style={{ top: 20 }}
      >
         <FormComponent form={form} initialValues={initialValues} isCreate={true} />
      </Modal>
   )
}

export default ModalCreateGame
