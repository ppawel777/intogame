import { CalendarOutlined } from '@ant-design/icons'
import { formatTime } from '@utils/formatDatetime'
import { Flex, Space } from 'antd'
import dayjs from 'dayjs'

import { calculateDuration, formatGameDate } from '../../utils/datetime'
import s from './DateTimeBlock.module.scss'

type Props = {
   game_time: string[] | null
   game_date: string | null
}

export const DateTimeBlock = ({ game_time, game_date }: Props) => {
   const [start, end] = game_time || ['', '']

   const formattedDate = formatGameDate(game_date)
   const duration = calculateDuration(start, end)

   return (
      <Space size="middle">
         <CalendarOutlined style={{ fontSize: '24px' }} />
         <Flex vertical>
            <p className={s.date}>
               {dayjs(start).format(formatTime)} – {dayjs(end).format(formatTime)}, {formattedDate}
            </p>
            <p className={s.time}>{duration} мин.</p>
         </Flex>
      </Space>
   )
}
