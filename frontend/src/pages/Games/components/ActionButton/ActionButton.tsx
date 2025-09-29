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

   const [, contextHolder] = message.useMessage()

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
         message.error(error.message)
      } finally {
         setLoading(false)
      }
   }

   const unvoteGame = async () => {
      setLoading(true)
      try {
         const { error, data } = await supabase
            .from('votes')
            .update({ status: 'cancelled' })
            .eq('user_id', String(userId))
            .eq('game_id', String(id))
            .eq('status', 'pending')
            .select('*')

         if (error) throw error

         if (!data || data.length === 0) {
            message.warning('Подходящих записей не найдено')
         } else {
            message.success('Запись отменена')
         }
         refresh()
      } catch (error: any) {
         message.error(error.message)
      } finally {
         setLoading(false)
      }
   }

   const handlePayment = async () => {
      if (!isPending) {
         return message.error('Оплата невозможна: статус не "ожидает оплаты"')
      }

      // Защита от повторного нажатия
      setLoading(true)

      try {
         const returnUrl = `${window.location.origin}/#/games/reserved`
         const contributionAmount =
            players_limit && players_limit > 0 ? Math.ceil((game_price || 0) / players_limit) : game_price || 0
         const response = await fetch('/api/create-payment', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               amount: contributionAmount,
               description: `Оплата участия в игре #${id}`,
               metadata: { gameId: id, userId },
               returnUrl,
            }),
         })

         const data = await response.json()

         if (!response.ok) {
            throw new Error(data.error || `Ошибка ${response.status}`)
         }

         // YooKassa возвращает объект с `confirmation_url`
         if (data.paymentId) {
            try {
               localStorage.setItem('lastPaymentId', data.paymentId)
            } catch (e) {
               // ignore storage errors (Safari private mode etc.)
               void e
            }
         }

         const redirectUrl = data.confirmation_url || data.confirmationUrl
         if (redirectUrl) {
            // Перенаправляем пользователя на страницу оплаты
            window.location.href = redirectUrl
         } else {
            throw new Error('Не получен URL для оплаты')
         }
      } catch (error: any) {
         console.error('Ошибка оплаты:', error)
         message.error(
            error.message.includes('429')
               ? 'Слишком много запросов. Подождите немного.'
               : error.message || 'Не удалось создать платёж. Попробуйте позже.',
         )
      } finally {
         setLoading(false)
      }
   }

   const handleRefund = async () => {
      setLoading(true)
      try {
         // Сначала получаем payment_id из votes
         const { data: voteData, error: voteError } = await supabase
            .from('votes')
            .select('payment_id')
            .eq('user_id', userId)
            .eq('game_id', id)
            .eq('status', 'confirmed')
            .single()

         if (voteError || !voteData?.payment_id) {
            throw new Error('Не найден payment_id для возврата')
         }

         const resp = await fetch('/api/refund-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId: voteData.payment_id }),
         })
         // Надёжный парсинг ответа (JSON или текст)
         const raw = await resp.text()
         let data: any = {}
         try {
            data = raw ? JSON.parse(raw) : {}
         } catch (_) {
            data = { error: raw }
         }
         if (!resp.ok) {
            let serverMsg = ''
            if (data && typeof data === 'object') {
               const details = (data as any).details
               if (details && typeof details === 'object') {
                  serverMsg = details.description || details.message || details.error || ''
               } else if (typeof details === 'string') {
                  serverMsg = details
               }
               if (!serverMsg && typeof (data as any).error === 'string') {
                  serverMsg = (data as any).error
               }
            }
            if (!serverMsg) serverMsg = raw || ''
            throw new Error(serverMsg || `Ошибка ${resp.status}`)
         }

         // Обновляем статус голоса на cancelled
         const { error: updateError } = await supabase
            .from('votes')
            .update({ status: 'cancelled' })
            .eq('user_id', userId)
            .eq('game_id', id)
            .eq('status', 'confirmed')

         if (updateError) throw updateError

         message.success('Оплата отменена и запись удалена')
         refresh()
      } catch (e: any) {
         const msg =
            typeof e?.message === 'string' && e.message.trim()
               ? e.message
               : typeof e === 'string' && e.trim()
                 ? e
                 : 'Не удалось отменить оплату'
         console.error('handleRefund error:', e)
         message.error(msg)
      } finally {
         setLoading(false)
      }
   }

   if (!isActive) {
      return (
         <>
            {contextHolder}
            <Button block disabled>
               Игра {game_status}
            </Button>
         </>
      )
   }

   if (isConfirmed) {
      return (
         <>
            {contextHolder}
            <div style={{ textAlign: 'center', marginTop: 16, padding: '8px 0', color: 'green', fontWeight: 'bold' }}>
               Игра оплачена
            </div>
            <Popconfirm
               title="Отменить запись?"
               description="Вы уверены, что хотите отменить запись на игру? Деньги будут возвращены."
               onConfirm={handleRefund}
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
