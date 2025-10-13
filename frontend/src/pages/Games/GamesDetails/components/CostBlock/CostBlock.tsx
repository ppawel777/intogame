/* eslint-disable @typescript-eslint/no-unused-vars */
import { CreditCardOutlined, PhoneOutlined } from '@ant-design/icons'
import { getRandomColor } from '@utils/colors'

import { Avatar, Collapse, Flex, Space, Typography } from 'antd'
import { Rules } from './Rules/Rules'
import { ActionButton } from '@pages/Games/components'
import { GameType } from '@typesDir/gameTypes'

const { Text } = Typography

type Props = {
   game_price: number | null
   players_min: number | null
   game: GameType
   setLoading: React.Dispatch<React.SetStateAction<boolean>>
   userId: number | null
   refresh: () => void
}

export const CostBlock = ({ game_price, players_min, game, setLoading, userId, refresh }: Props) => {
   if (!game_price) return null

   return (
      <>
         <Space size="middle">
            <CreditCardOutlined style={{ fontSize: '24px' }} />
            <Flex vertical gap={4}>
               <span style={{ fontWeight: '700' }}>Бронирование и оплата</span>
               <p>
                  Стоимость игры -{' '}
                  <Text style={{ color: 'green' }}>
                     {players_min && players_min > 0 && game_price ? Math.ceil(game_price / players_min) : '—'} ₽
                  </Text>
               </p>
            </Flex>
         </Space>
         <Rules />
         <div style={{ marginTop: '24px' }}>
            <ActionButton game={game} setLoading={setLoading} userId={userId} refresh={refresh} />
         </div>
      </>
   )
}
