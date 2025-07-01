import { Form, Modal, message } from 'antd'
import FormComponent from './FormComponent'
import dayjs from 'dayjs'
import { useUpdatedGame } from '@hooks/games/useSupabaseGames'

type Props = {
   gamesData: any[]
   id: number
   handleChangeVisibleModal: (visible: boolean, id: number) => void
   setChangeGame: React.Dispatch<React.SetStateAction<boolean>>
}

const ModalEditGame = ({ gamesData, id, handleChangeVisibleModal, setChangeGame }: Props) => {
   const [form] = Form.useForm()

   const currentGameData = gamesData.find((f) => f.id === id)
   const editGameFetch = async (values: any) => {
      try {
         const { data, error } = await useUpdatedGame(values, id)

         if (error) throw error
         data && message.success('Игра обновлена')
         setChangeGame(true)
         handleChangeVisibleModal(false, 0)
      } catch (error: any) {
         message.error(error.message)
      }
   }

   const editGameFunction = () => {
      form.submit()
      form
         .validateFields()
         .then((values) => {
            editGameFetch(values)
         })
         .catch((errorList) => {
            errorList.errorFields.forEach((item: { name: string[]; errors: string[] }) => {
               message.error({ content: item.name[0] + ': ' + item.errors[0], duration: 6 })
            })
         })
   }

   const [startTime, endTime] = currentGameData.game_time

   const initialValues = {
      place_id: currentGameData.place_id,
      game_date: dayjs(currentGameData.game_date),
      game_time: [dayjs(startTime), dayjs(endTime)],
      game_price: currentGameData.game_price,
      players_limit: currentGameData.players_limit,
      is_active: currentGameData.is_active,
   }

   return (
      <Modal
         title="Редактировать игру"
         open
         maskClosable={false}
         onOk={editGameFunction}
         okText="Сохранить"
         onCancel={() => handleChangeVisibleModal(false, 0)}
         cancelText="Закрыть"
         width="80vw"
         style={{ top: 20 }}
      >
         <FormComponent form={form} initialValues={initialValues} />
      </Modal>
   )
}

export default ModalEditGame
