import { Badge, Space } from 'antd'
import { FormOutlined } from '@ant-design/icons'

import s from './GameCardExtra.module.scss'

type GameCardExtraProps = {
   isManager?: boolean
   gameId: number
   onEdit?: (id: number) => void
   playerTotal?: number
   playerLimit?: number | null
}

export const GameCardExtra = ({ isManager, gameId, onEdit, playerTotal = 0, playerLimit = 0 }: GameCardExtraProps) => {
   const isFull = playerLimit ? playerTotal >= playerLimit : false

   return (
      <Space>
         <Badge
            status={isFull ? 'error' : 'success'}
            text={<span className={isFull ? s.extraFull : s.extraSuccess}>{isFull ? 'Нет мест' : 'Есть места'}</span>}
         />

         {isManager && <FormOutlined className={s.editGameBtn} onClick={() => onEdit?.(gameId)} />}
      </Space>
   )
}
