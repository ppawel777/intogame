import { useState } from 'react'
import { Button, InputNumber, Popconfirm, message } from 'antd'
import { supabase } from '@supabaseDir/supabaseClient'

import { GameType } from '@typesDir/gameTypes'
import { extractErrorMessage } from '@pages/Games/utils/games_utils'
import payment_icon from '@img/iokassa-gray.svg'

type Props = {
   game: GameType
   setLoading: React.Dispatch<React.SetStateAction<boolean>>
   userId: number | null
   refresh: () => void
}

export const ActionButton = ({ game, userId, setLoading, refresh }: Props) => {
   const [quantity, setQuantity] = useState(1)
   const [, contextHolder] = message.useMessage()

   if (!userId) return null

   const { id, game_price, players_limit, confirmed_players_count, game_status, user_vote_status } = game

   const isFull = confirmed_players_count >= (players_limit || 0)
   const isActive = game_status === 'Активна' || !game_status

   const isConfirmed = user_vote_status === 'confirmed'
   const isPending = user_vote_status === 'pending'

   const maxAvailable = Math.max(0, (players_limit || 0) - confirmed_players_count)

   const voteGame = async (quantity: number = 1) => {
      if (!isActive) return
      if (!game_price || game_price <= 0) return
      if (quantity < 1 || quantity > maxAvailable) {
         return message.error('Недопустимое количество мест')
      }

      setLoading(true)
      try {
         const { error } = await supabase
            .from('votes')
            .insert({ user_id: userId, game_id: id, status: 'pending', quantity })

         if (error) throw error

         if (quantity > 1) message.success(`Забронировано ${quantity} мест`)
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

      setLoading(true)
      try {
         const returnUrl = `${window.location.origin}/#/games/reserved`

         const { data: voteData, error: voteError } = await supabase
            .from('votes')
            .select('quantity')
            .eq('user_id', userId)
            .eq('game_id', id)
            .eq('status', 'pending')
            .single()

         if (voteError || !voteData) {
            message.error('Не удалось получить данные о бронировании')
            refresh()
            return
         }

         const actualQuantity = voteData.quantity
         const pricePerPlayer = Math.ceil((game_price || 0) / (players_limit || 1))
         const totalContribution = pricePerPlayer * actualQuantity

         const response = await fetch('/api/create-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               amount: totalContribution,
               description:
                  actualQuantity > 1
                     ? `Оплата за ${actualQuantity} участника(ов) в игре #${id}`
                     : `Оплата участия в игре #${id}`,
               metadata: { gameId: id, userId, actualQuantity },
               returnUrl,
            }),
         })

         const data = await response.json()

         if (!response.ok) {
            if (data.details?.includes('срок бронирования истёк')) {
               message.warning(data.details)
               refresh()
               return
            }
            throw new Error(data.error || `Ошибка ${response.status}`)
         }

         if (data.confirmationUrl) {
            window.location.href = data.confirmationUrl
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
         const { user_payment_id: paymentId } = game

         if (!paymentId) {
            throw new Error('Не найден платёж для возврата')
         }

         const resp = await fetch('/api/refund-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
         })

         const raw = await resp.text()
         let data: any = {}
         try {
            data = raw ? JSON.parse(raw) : {}
         } catch (_) {
            data = { error: raw }
         }

         if (!resp.ok) {
            const msg = extractErrorMessage(data) || `Ошибка ${resp.status}`
            throw new Error(msg)
         }

         message.success('Оплата отменена и запись удалена')
         refresh()
      } catch (e: any) {
         const msg = e.message || 'Не удалось отменить оплату'
         console.error('handleRefund error:', e)
         message.error(msg)
      } finally {
         setLoading(false)
      }
   }

   const QuantitySelector = () => (
      <div style={{ marginTop: 8 }}>
         <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: 6 }}>Количество мест:</label>
         <InputNumber
            min={1}
            max={maxAvailable}
            value={quantity}
            onChange={(val) => setQuantity(val || 1)}
            style={{ width: '100%' }}
         />
      </div>
   )

   const renderSignUpButton = () => (
      <Popconfirm
         title="Записаться на игру?"
         description={<QuantitySelector />}
         onConfirm={() => voteGame(quantity)}
         okText="Да, записаться"
         cancelText="Нет"
      >
         <Button type="primary" block style={{ marginTop: 16 }} disabled={isFull}>
            {isFull ? 'Мест нет' : 'Записаться'}
         </Button>
      </Popconfirm>
   )

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
               <img src={payment_icon} alt="payment" style={{ height: '20px', marginLeft: '8px' }} />
            </Button>
            <Popconfirm
               title="Отменить запись?"
               description="Вы уверены, что хотите отменить запись?"
               onConfirm={unvoteGame}
               okText="Да"
               cancelText="Нет"
            >
               <Button danger block style={{ marginTop: 16 }}>
                  Отменить бронь
               </Button>
            </Popconfirm>
         </>
      )
   }

   return (
      <>
         {contextHolder}
         {renderSignUpButton()}
      </>
   )
}
