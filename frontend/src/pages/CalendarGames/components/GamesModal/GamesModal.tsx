import { GamesModalProps } from '@pages/CalendarGames/types'
import { Badge, Flex, Modal, Progress, Space, Tooltip, Typography } from 'antd'
import { BookOutlined, ExportOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

import s from './GamesModal.module.scss'
import { statusToBadgeType } from '@pages/CalendarGames/utils/helpers'

const { Text } = Typography

export const GamesModal = ({ isOpen, onClose, games, date }: GamesModalProps) => {
   console.log(games)
   return (
      <Modal title={date ? `Игры на ${date.format('DD-MM-YYYY')}` : ''} open={isOpen} onCancel={onClose} footer={null}>
         <ul className={s.modalList}>
            {games.map((game) => (
               <li key={game.id} className={s.modalItem}>
                  <Flex vertical gap="small" style={{ width: '100%' }}>
                     <Space className={s.modalItemActions}>
                        <BookOutlined style={{ fontSize: '18px', cursor: 'pointer' }} />
                        <ExportOutlined style={{ fontSize: '18px', cursor: 'pointer' }} />
                     </Space>
                     {game.game_time && (
                        <div className={s.modalItemTime}>
                           {dayjs(game.game_time[0]).format('HH:mm')} - {dayjs(game.game_time[1]).format('HH:mm')}
                        </div>
                     )}
                     <div className={s.modalItemPlace}>{game.place_name}</div>
                     <Badge status={statusToBadgeType[game.game_status || '']} text={game.game_status} />
                     <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                        <div style={{ flex: 1 }}>
                           {game.game_status === 'Активна' && (
                              <Progress
                                 percent={
                                    game.players_limit ? Math.round((game.confirmed_count / game.players_limit) * 100) : 0
                                 }
                                 size="small"
                                 status={
                                    game.players_limit && game.confirmed_count >= game.players_limit ? 'success' : 'active'
                                 }
                                 strokeWidth={10}
                                 style={{ margin: 0, maxWidth: '30%' }}
                                 format={(percent) => (
                                    <Tooltip title={`${game.confirmed_count} из ${game.players_limit || 0}`}>
                                       <span style={{ fontSize: '12px' }}>{percent}%</span>
                                    </Tooltip>
                                 )}
                              />
                           )}
                        </div>
                        {game.game_status === 'Активна' && (
                           <Text style={{ color: 'green' }}>
                              {game.players_limit && game.players_limit > 0 && game.game_price
                                 ? Math.ceil(game.game_price / game.players_limit)
                                 : '—'}{' '}
                              ₽
                           </Text>
                        )}
                     </Flex>
                  </Flex>
               </li>
            ))}
         </ul>
      </Modal>
   )
}
