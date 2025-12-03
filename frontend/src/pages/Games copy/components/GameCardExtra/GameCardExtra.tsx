import { Badge, Space } from 'antd'
import { FormOutlined } from '@ant-design/icons'

import s from './GameCardExtra.module.scss'

type GameCardExtraProps = {
   isArchive?: boolean
   gameId: number
   onEdit?: (id: number) => void
   playerTotal?: number
   playerLimit?: number | null
}

export const GameCardExtra = ({
   isArchive,
   gameId,
   onEdit,
   playerTotal = 0,
   playerLimit = 0,
}: GameCardExtraProps) => {
   const isFull = playerTotal >= playerLimit

   return (
      <Space>
         {!isArchive && (
            <Badge
               status={isFull ? 'error' : 'success'}
               text={<span className={isFull ? s.extraFull : s.extraSuccess}>{isFull ? 'Нет мест' : 'Есть места'}</span>}
            />
         )}

         {!isArchive ? (
            <FormOutlined className={s.editGameBtn} onClick={() => onEdit?.(gameId)} />
         ) : (
            <Badge status="default" text={<span className={s.extraClose}>Игра состоялась</span>} />
         )}
      </Space>
   )
}
