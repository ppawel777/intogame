import { NextApiRequest, NextApiResponse } from 'next'

type CreatePaymentBody = {
   gameId: number
   userId: number
}

// type YooKassaError = {
//    type: string
//    id: string
//    code: string
//    parameter?: string
//    description: string
//    retryable?: boolean
// }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
   if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Метод не поддерживается' })
   }

   const { gameId, userId }: CreatePaymentBody = req.body

   if (!gameId || !userId) {
      return res.status(400).json({ error: 'Не хватает gameId или userId' })
   }

   try {
      const paymentData = await createYooKassaPayment({
         gameId,
         userId,
         amount: 500, // Можно получать из БД
         description: `Участие в игре #${gameId}`,
      })

      return res.status(200).json({
         confirmation_url: paymentData.confirmation.confirmation_url,
         payment_id: paymentData.id,
      })
   } catch (error: any) {
      console.error('Ошибка при создании платежа:', error)

      if (error.response) {
         const { status, data } = error.response
         return res.status(status).json({
            error: data.error?.description || 'Ошибка при создании оплаты',
            details: data,
         })
      }

      return res.status(500).json({ error: 'Внутренняя ошибка сервера' })
   }
}

// Основная функция создания платежа
async function createYooKassaPayment({
   gameId,
   userId,
   amount,
   description,
}: {
   gameId: number
   userId: number
   amount: number
   description: string
}) {
   const SHOP_ID = process.env.YOOKASSA_SHOP_ID
   const SECRET_KEY = process.env.YOOKASSA_SECRET_KEY

   const auth = Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString('base64')

   const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
         Authorization: `Basic ${auth}`,
         'Content-Type': 'application/json',
         'Idempotency-Key': `${userId}-${gameId}-${Date.now()}`, // защита от дублей
      },
      body: JSON.stringify({
         amount: {
            value: amount.toFixed(2),
            currency: 'RUB',
         },
         confirmation: {
            type: 'redirect',
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/profile`,
         },
         capture: true,
         description,
         metadata: {
            game_id: String(gameId),
            user_id: String(userId),
         },
      }),
   })

   if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`HTTP ${response.status}: ${errorData.error?.description || 'Неизвестная ошибка'}`)
   }

   return await response.json()
}
