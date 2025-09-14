import { useState } from 'react'
import { Button, Popconfirm, message } from 'antd'
import { supabase } from '@supabaseDir/supabaseClient'

import { GameType } from '@typesDir/gameTypes'

type Props = {
   game: GameType
   isArchive?: boolean
   setLoading: React.Dispatch<React.SetStateAction<boolean>>
   userId: number | null
   refresh: () => void
}

export const ActionButton = ({ game, isArchive, userId, setLoading, refresh }: Props) => {
   const [confirmOpen, setConfirmOpen] = useState(false)

   const [messageApi, contextHolder] = message.useMessage()

   if (isArchive || !userId) return null

   const { id, game_price, players_limit, confirmed_players_count, game_status, user_vote_status } = game

   const isFull = confirmed_players_count >= (players_limit || 0)
   const isActive = game_status === 'Активна' || !game_status

   const isConfirmed = user_vote_status === 'confirmed'
   const isPending = user_vote_status === 'pending'
   const isCancelledOrFailed = ['cancelled', 'failed'].includes(user_vote_status || '')

   const voteGame = async () => {
      if (!isActive) return
      // message.error('Игра не активна')
      if (!game_price || game_price <= 0) return
      // message.error('Цена не указана')

      setLoading(true)
      try {
         const { error } = await supabase.from('votes').insert({ user_id: userId, game_id: id, status: 'pending' })

         if (error) throw error

         refresh()
      } catch (error: any) {
         messageApi.error(error.message)
      } finally {
         setLoading(false)
      }
   }

   const unvoteGame = async () => {
      setLoading(true)
      try {
         const { error } = await supabase.from('votes').delete().eq('user_id', userId).eq('game_id', id)

         if (error) throw error

         messageApi.success('Запись отменена')
         refresh()
      } catch (error: any) {
         messageApi.error(error.message)
      } finally {
         setLoading(false)
      }
   }

   const handlePayment = async () => {
      if (!isPending) {
         return messageApi.error('Оплата невозможна: статус не "ожидает оплаты"')
      }

      // Защита от повторного нажатия
      setLoading(true)

      try {
         const response = await fetch('/api/create-payment', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ gameId: id, userId }),
         })

         const data = await response.json()

         if (!response.ok) {
            throw new Error(data.error || `Ошибка ${response.status}`)
         }

         // YooKassa возвращает объект с `confirmation_url`
         if (data.confirmation_url) {
            // Перенаправляем пользователя на страницу оплаты
            window.location.href = data.confirmation_url
         } else {
            throw new Error('Не получен URL для оплаты')
         }
      } catch (error: any) {
         console.error('Ошибка оплаты:', error)
         messageApi.error(
            error.message.includes('429')
               ? 'Слишком много запросов. Подождите немного.'
               : error.message || 'Не удалось создать платёж. Попробуйте позже.',
         )
      } finally {
         setLoading(false)
      }
   }

   if (!isActive) {
      return (
         <Button block disabled>
            Игра {game_status}
         </Button>
      )
   }

   if (isConfirmed) {
      return (
         <>
            {contextHolder}
            <Button type="primary" block style={{ marginTop: 16 }} disabled>
               Оплачено
            </Button>
            <Popconfirm
               title="Отменить запись?"
               description="Вы уверены, что хотите отменить запись на игру?"
               onConfirm={unvoteGame}
               okText="Да"
               cancelText="Нет"
            >
               <Button danger block style={{ marginTop: 16 }}>
                  Отменить запись
               </Button>
            </Popconfirm>
         </>
      )
   }

   if (isPending) {
      return (
         <>
            {contextHolder}
            <Button type="primary" block style={{ marginTop: 16 }} onClick={handlePayment}>
               Оплатить
            </Button>
            <Popconfirm
               title="Отменить запись?"
               description="Вы уверены, что хотите отменить запись?"
               onConfirm={unvoteGame}
               okText="Да"
               cancelText="Нет"
            >
               <Button danger block style={{ marginTop: 16 }}>
                  Отменить запись
               </Button>
            </Popconfirm>
         </>
      )
   }

   if (isCancelledOrFailed) {
      return (
         <Popconfirm
            title="Записаться на игру?"
            description={'Подтвердите запись'}
            onConfirm={voteGame}
            okText="Да, записаться"
            cancelText="Нет"
         >
            {contextHolder}
            <Button type="primary" block style={{ marginTop: 16 }} disabled={isFull}>
               {isFull ? 'Мест нет' : 'Записаться'}
            </Button>
         </Popconfirm>
      )
   }

   return (
      <Popconfirm
         title="Записаться на игру?"
         description={'Подтвердите запись'}
         open={confirmOpen}
         onConfirm={() => {
            voteGame()
            setConfirmOpen(false)
         }}
         onCancel={() => setConfirmOpen(false)}
         okText="Да, записаться"
         cancelText="Нет"
      >
         {contextHolder}
         <Button type="primary" block style={{ marginTop: 16 }} disabled={isFull} onClick={() => setConfirmOpen(true)}>
            {isFull ? 'Мест нет' : 'Записаться'}
         </Button>
      </Popconfirm>
   )
}
