import { useEffect, useState } from 'react'
import { Button, Empty, Flex, Skeleton, Space, message } from 'antd'
import { supabase } from '@supabaseDir/supabaseClient'
import { GameType } from '@typesDir/gameTypes'
import { GameCard } from '@components/GameCard'
import { GameStatusFilter } from '@components/GameStatusFilter'
import { useUserId } from '@utils/hooks/useUserId'
import { useIsMobile } from '@utils/hooks/useIsMobile'

import { PlusOutlined } from '@ant-design/icons'
import ModalCreateGame from '../ModalGame/ModalCreateGame'
import { MyGamesFilters } from './MyGamesFilters'

import ModalEditGame from '../ModalGame/ModalEditGame'
import s from '../GamesPage.module.scss'

type MyGamesFilterType = 'Участник' | 'Создатель' | 'Избранное' | null

const MyGames = () => {
   const [loading, setLoading] = useState(true)
   const [allGames, setAllGames] = useState<GameType[]>([])
   const [votedGameIds, setVotedGameIds] = useState<Set<string>>(new Set())
   const [createdGameIds, setCreatedGameIds] = useState<Set<string>>(new Set())
   const [favoriteGameIds, setFavoriteGameIds] = useState<Set<string>>(new Set())
   const [myGamesFilter, setMyGamesFilter] = useState<MyGamesFilterType>(null)
   const [isModalCreateOpen, setIsModalCreateOpen] = useState(false)
   const [isModalEditOpen, setIsModalEditOpen] = useState({ open: false, id: 0 })
   const [statusFilter, setStatusFilter] = useState<string>('Все')
   const { userId, loading: userLoading } = useUserId()

   const isMobile = useIsMobile()

   const navigateState = { state: { from: { pathname: '/games/my-games', title: 'Мои игры' } } }

   // Определяем доступные фильтры
   const availableFilters: MyGamesFilterType[] = []
   if (votedGameIds.size > 0) availableFilters.push('Участник')
   if (createdGameIds.size > 0) availableFilters.push('Создатель')
   if (favoriteGameIds.size > 0) availableFilters.push('Избранное')

   // Фильтруем игры по выбранному фильтру
   const filteredGamesByMyFilter = allGames.filter((game) => {
      if (!myGamesFilter) return true
      const gameIdStr = String(game.id)
      if (myGamesFilter === 'Участник') return votedGameIds.has(gameIdStr)
      if (myGamesFilter === 'Создатель') return createdGameIds.has(gameIdStr)
      if (myGamesFilter === 'Избранное') return favoriteGameIds.has(gameIdStr)
      return true
   })

   // Фильтруем по статусу
   const games =
      statusFilter === 'Все'
         ? filteredGamesByMyFilter
         : filteredGamesByMyFilter.filter((game) => game.game_status === statusFilter)

   useEffect(() => {
      if (!userId) return

      const fetchMyGames = async () => {
         setLoading(true)
         try {
            // Получаем игры, за которые пользователь проголосовал или оплатил
            const { data: votesData, error: votesError } = await supabase
               .from('votes')
               .select('game_id')
               .eq('user_id', userId)
               .in('status', ['pending', 'confirmed'])

            if (votesError) throw votesError

            const votedIds = votesData?.map((vote) => vote.game_id) || []

            // Получаем избранные игры
            const { data: favoritesData, error: favoritesError } = await supabase
               .from('favorites')
               .select('game_id')
               .eq('user_id', userId)

            if (favoritesError) throw favoritesError

            const favoriteIds = favoritesData?.map((fav) => fav.game_id) || []

            // Получаем игры, которые создал пользователь
            const { data: createdGamesData, error: createdError } = await supabase
               .from('view_games')
               .select('*')
               .eq('creator_id', userId)

            if (createdError) throw createdError

            const createdIds = (createdGamesData || []).map((game) => game.id)

            // Получаем игры, на которые пользователь записался
            let votedGamesData: GameType[] = []
            if (votedIds.length > 0) {
               const { data, error: gamesError } = await supabase.from('view_games').select('*').in('id', votedIds)

               if (gamesError) throw gamesError
               votedGamesData = data || []
            }

            // Получаем избранные игры (если они не были загружены ранее)
            const allGameIdsSet = new Set([...createdIds, ...votedIds])
            const missingFavoriteIds = favoriteIds.filter((id) => !allGameIdsSet.has(id))

            let favoriteGamesData: GameType[] = []
            if (missingFavoriteIds.length > 0) {
               const { data, error: favGamesError } = await supabase
                  .from('view_games')
                  .select('*')
                  .in('id', missingFavoriteIds)

               if (favGamesError) throw favGamesError
               favoriteGamesData = data || []
            }

            // Объединяем игры и убираем дубликаты
            const allGamesMap = new Map<string, GameType>()
            ;[...(createdGamesData || []), ...votedGamesData, ...favoriteGamesData].forEach((game) => {
               allGamesMap.set(game.id, game)
            })

            const sortedGames = Array.from(allGamesMap.values()).sort((a, b) => {
               const dateA = new Date(a.game_date || '').getTime()
               const dateB = new Date(b.game_date || '').getTime()
               return dateA - dateB
            })

            // Сохраняем данные
            setAllGames(sortedGames)
            setVotedGameIds(new Set(votedIds.map(String)))
            setCreatedGameIds(new Set(createdIds.map(String)))
            setFavoriteGameIds(new Set(favoriteIds.map(String)))

            // Устанавливаем фильтр по умолчанию (первый доступный слева-направо)
            if (myGamesFilter === null) {
               if (votedIds.length > 0) {
                  setMyGamesFilter('Участник')
               } else if (createdIds.length > 0) {
                  setMyGamesFilter('Создатель')
               } else if (favoriteIds.length > 0) {
                  setMyGamesFilter('Избранное')
               }
            }
         } catch (error: any) {
            message.error('Ошибка загрузки данных: ' + error.message)
         } finally {
            setLoading(false)
         }
      }

      fetchMyGames()
   }, [userId])

   const refresh = () => {
      if (userId) {
         const fetchMyGames = async () => {
            setLoading(true)
            try {
               const { data: votesData, error: votesError } = await supabase
                  .from('votes')
                  .select('game_id')
                  .eq('user_id', userId)
                  .in('status', ['pending', 'confirmed'])

               if (votesError) throw votesError

               const votedIds = votesData?.map((vote) => vote.game_id) || []

               const { data: favoritesData, error: favoritesError } = await supabase
                  .from('favorites')
                  .select('game_id')
                  .eq('user_id', userId)

               if (favoritesError) throw favoritesError

               const favoriteIds = favoritesData?.map((fav) => fav.game_id) || []

               const { data: createdGamesData, error: createdError } = await supabase
                  .from('view_games')
                  .select('*')
                  .eq('creator_id', userId)

               if (createdError) throw createdError

               const createdIds = (createdGamesData || []).map((game) => game.id)

               let votedGamesData: GameType[] = []
               if (votedIds.length > 0) {
                  const { data, error: gamesError } = await supabase.from('view_games').select('*').in('id', votedIds)

                  if (gamesError) throw gamesError
                  votedGamesData = data || []
               }

               const allGameIdsSet = new Set([...createdIds, ...votedIds])
               const missingFavoriteIds = favoriteIds.filter((id) => !allGameIdsSet.has(id))

               let favoriteGamesData: GameType[] = []
               if (missingFavoriteIds.length > 0) {
                  const { data, error: favGamesError } = await supabase
                     .from('view_games')
                     .select('*')
                     .in('id', missingFavoriteIds)

                  if (favGamesError) throw favGamesError
                  favoriteGamesData = data || []
               }

               const allGamesMap = new Map<string, GameType>()
               ;[...(createdGamesData || []), ...votedGamesData, ...favoriteGamesData].forEach((game) => {
                  allGamesMap.set(game.id, game)
               })

               const sortedGames = Array.from(allGamesMap.values()).sort((a, b) => {
                  const dateA = new Date(a.game_date || '').getTime()
                  const dateB = new Date(b.game_date || '').getTime()
                  return dateA - dateB
               })

               setAllGames(sortedGames)
               setVotedGameIds(new Set(votedIds.map(String)))
               setCreatedGameIds(new Set(createdIds.map(String)))
               setFavoriteGameIds(new Set(favoriteIds.map(String)))
            } catch (error: any) {
               message.error('Ошибка загрузки данных: ' + error.message)
            } finally {
               setLoading(false)
            }
         }
         fetchMyGames()
      }
   }

   const openCreateModal = () => setIsModalCreateOpen(true)
   const closeCreateModal = () => setIsModalCreateOpen(false)
   const openEditModal = (e: React.MouseEvent, id: number) => {
      e.stopPropagation()
      setIsModalEditOpen({ open: true, id })
   }
   const closeEditModal = () => setIsModalEditOpen({ open: false, id: 0 })

   return (
      <div className={s.wrapReserved}>
         <Flex
            vertical={isMobile}
            justify="space-between"
            align={isMobile ? 'stretch' : 'center'}
            gap={isMobile ? 'small' : 'middle'}
            style={{ marginBottom: '32px' }}
         >
            <Space align="start" size={isMobile ? 'middle' : 'large'}>
               <h3 style={{ margin: '4px 0' }}>Мои игры</h3>
               <Button icon={<PlusOutlined />} onClick={openCreateModal}>
                  Создать игру
               </Button>
            </Space>
            <GameStatusFilter value={statusFilter} onChange={setStatusFilter} size={isMobile ? 'small' : 'middle'} />
         </Flex>

         {loading || userLoading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
         ) : allGames.length === 0 ? (
            <Empty description={'У вас нет записей на игры'} style={{ padding: '48px 0' }} />
         ) : (
            <>
               <MyGamesFilters
                  value={myGamesFilter}
                  onChange={setMyGamesFilter}
                  availableFilters={availableFilters}
                  size={isMobile ? 'small' : 'middle'}
               />
               <div className={s.gamesList}>
                  {games.map((game) => (
                     <GameCard
                        key={game.id}
                        game={game}
                        userId={userId}
                        setLoading={setLoading}
                        refresh={refresh}
                        navigateState={navigateState}
                        onEdit={openEditModal}
                     />
                  ))}
               </div>
            </>
         )}
         {isModalCreateOpen && <ModalCreateGame onClose={closeCreateModal} onSuccess={refresh} />}
         {isModalEditOpen.open && <ModalEditGame id={isModalEditOpen.id} onClose={closeEditModal} onSuccess={refresh} />}
      </div>
   )
}

export default MyGames
