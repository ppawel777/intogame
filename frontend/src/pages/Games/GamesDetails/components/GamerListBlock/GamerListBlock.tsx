import { Flex, Space } from 'antd'
import { ContactsOutlined } from '@ant-design/icons'
import { PlayersList } from './PlayersList/PlayersList'
import { Organizator } from './Organizator/Organizator'

type Props = {
   confirmed_players_count: number | null
   players_min: number | null
   players_limit: number | null
   gameId?: number
   creator_id?: number | null
}

export const GamerListBlock = ({ confirmed_players_count, players_min, players_limit, gameId, creator_id }: Props) => {
   return (
      <>
         <Space size="middle">
            <ContactsOutlined style={{ fontSize: '24px' }} />
            <Flex vertical gap={4}>
               <p>Минимальное количество - {players_min || 0} чел.</p>
               <p>Максимальное количество - {players_limit || 0} чел.</p>
            </Flex>
         </Space>

         {gameId && (
            <div style={{ marginTop: '20px' }}>
               <PlayersList
                  gameId={gameId}
                  confirmed_players_count={confirmed_players_count}
                  players_limit={players_limit}
               />
            </div>
         )}

         <Organizator gameId={gameId} creator_id={creator_id} />
      </>
   )
}
