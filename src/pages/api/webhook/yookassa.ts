import { buffer } from 'micro'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Отключаем body parser
export const config = {
   api: {
      bodyParser: false,
   },
}

const handler = async (req: any, res: any) => {
   if (req.method !== 'POST') return res.status(405).end()

   const buf = await buffer(req)
   // const sig = req.headers['x webhook-signature']

   // ЮKassa не использует подпись в body — нужно проверять через Basic Auth или игнорировать
   // Для безопасности можно добавить секретный путь или проверку IP

   let event
   try {
      event = JSON.parse(buf.toString())
   } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`)
   }

   const { object: payment } = event

   const { game_id, user_id } = payment.metadata || {}
   const voteId = parseInt(game_id)
   const userId = parseInt(user_id)

   if (!voteId || !userId) {
      return res.status(400).json({ error: 'Нет данных в metadata' })
   }

   try {
      if (payment.status === 'succeeded') {
         await supabase
            .from('votes')
            .update({
               status: 'confirmed',
               payment_verified: true,
               paid_at: new Date().toISOString(),
            })
            .eq('game_id', voteId)
            .eq('user_id', userId)
      } else if (payment.status === 'canceled') {
         await supabase.from('votes').update({ status: 'cancelled' }).eq('game_id', voteId).eq('user_id', userId)
      }

      res.status(200).json({ received: true })
   } catch (error) {
      console.error('Ошибка в вебхуке:', error)
      res.status(500).json({ error: 'Ошибка обработки' })
   }
}

export default handler
