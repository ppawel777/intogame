import { useState } from 'react'
import { Button, message } from 'antd'
import { Popconfirm } from 'antd'

import { GameType } from '@typesDir/gameTypes'
import { supabase } from '@supabaseDir/supabaseClient'

type Props = {
   game: GameType
   userVoteIds: number[]
   setUserVoteIds: React.Dispatch<React.SetStateAction<number[]>>
   isArchive?: boolean
   setLoading: React.Dispatch<React.SetStateAction<boolean>>
   userId: number | null
   refresh: () => void
}

export const ActionButton = ({ game, userVoteIds, setUserVoteIds, isArchive, userId, setLoading, refresh }: Props) => {
   const [confirmOpen, setConfirmOpen] = useState(false)

   if (isArchive) return null

   const { players_total, players_limit, id } = game

   const hasVoted = userVoteIds.includes(id)
   const isFull = players_total >= players_limit

   // Голосование
   const voteGame = async (gameId: number) => {
      if (!userId) return
      setLoading(true)
      try {
         const { error } = await supabase.from('votes').insert({ user_id: userId, game_id: gameId })
         if (error) throw error
         message.success('Вы записаны на игру')
         setUserVoteIds((prev) => [...prev, gameId])
         refresh()
      } catch (error: any) {
         message.error(error.message)
      } finally {
         setLoading(false)
      }
   }

   // Отмена голоса
   const unvoteGame = async (gameId: number) => {
      if (!userId) return
      setLoading(true)
      try {
         const { error } = await supabase.from('votes').delete().eq('user_id', userId).eq('game_id', gameId)

         if (error) throw error
         message.success('Запись отменена')
         setUserVoteIds((prev) => prev.filter((vote) => vote !== gameId))
         refresh()
      } catch (error: any) {
         message.error(error.message)
      } finally {
         setLoading(false)
      }
   }

   return hasVoted ? (
      <Popconfirm
         title="Отменить запись?"
         description="Вы уверены, что хотите отменить запись на эту игру?"
         open={confirmOpen}
         onConfirm={() => {
            unvoteGame(id)
            setConfirmOpen(false)
         }}
         onCancel={() => setConfirmOpen(false)}
         okText="Да, отменить"
         cancelText="Нет"
      >
         <Button danger block style={{ marginTop: 16 }} onClick={() => setConfirmOpen(true)}>
            Отменить запись
         </Button>
      </Popconfirm>
   ) : (
      <Popconfirm
         title="Записаться на игру?"
         description="Подтвердите запись. Место будет зарезервировано."
         open={confirmOpen}
         onConfirm={() => {
            voteGame(id)
            setConfirmOpen(false)
         }}
         onCancel={() => setConfirmOpen(false)}
         okText="Да, записаться"
         cancelText="Нет"
      >
         <Button type="primary" block style={{ marginTop: 16 }} disabled={isFull} onClick={() => setConfirmOpen(true)}>
            {isFull ? 'Мест нет' : 'Записаться'}
         </Button>
      </Popconfirm>
   )
}
