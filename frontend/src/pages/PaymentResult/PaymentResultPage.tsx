import { useEffect, useState } from 'react'
import { Button, Result, Spin } from 'antd'
import { useNavigate, useSearchParams } from 'react-router-dom'

const PaymentResultPage = () => {
   const [searchParams] = useSearchParams()
   const navigate = useNavigate()
   const [loading, setLoading] = useState(true)
   const [status, setStatus] = useState<
      'pending' | 'succeeded' | 'canceled' | 'waiting_for_capture' | 'canceled_by_user' | 'unknown'
   >('pending')

   useEffect(() => {
      const paymentId = searchParams.get('paymentId') || localStorage.getItem('lastPaymentId') || ''
      if (!paymentId) {
         setStatus('unknown')
         setLoading(false)
         return
      }

      const fetchStatus = async () => {
         try {
            const resp = await fetch(`/api/payment-status/${paymentId}`)
            const data = await resp.json()
            if (!resp.ok) throw new Error(data?.error || 'Failed')
            setStatus((data?.status as any) || 'unknown')
            // При успехе — дергаем verify, чтобы гарантированно записать статус в БД
            if (data?.status === 'succeeded') {
               try {
                  await fetch('/api/verify-payment', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ paymentId }),
                  })
               } catch {
                  // no-op
               }
            }
         } catch (e) {
            setStatus('unknown')
         } finally {
            setLoading(false)
         }
      }

      fetchStatus()
   }, [searchParams])

   if (loading) {
      return <Spin style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '40vh' }} />
   }

   const isSuccess = status === 'succeeded'
   const isPending = status === 'pending' || status === 'waiting_for_capture'
   const isCanceled = status === 'canceled' || status === 'canceled_by_user'

   return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
         {isSuccess && (
            <Result
               status="success"
               title="Оплата выполнена"
               subTitle="Спасибо! Оплата подтверждена."
               extra={[
                  <Button type="primary" key="home" onClick={() => navigate('/')}>
                     На главную
                  </Button>,
               ]}
            />
         )}
         {isPending && (
            <Result
               status="info"
               title="Оплата в обработке"
               subTitle="Мы ещё ожидаем подтверждение платежа. Обновите страницу позже."
               extra={[
                  <Button key="refresh" onClick={() => window.location.reload()}>
                     Обновить
                  </Button>,
               ]}
            />
         )}
         {isCanceled && (
            <Result
               status="warning"
               title="Оплата отменена"
               subTitle="Вы отменили платёж."
               extra={[
                  <Button type="primary" key="home" onClick={() => navigate('/')}>
                     На главную
                  </Button>,
               ]}
            />
         )}
         {!isSuccess && !isPending && !isCanceled && (
            <Result
               status="error"
               title="Не удалось получить статус платежа"
               extra={[
                  <Button type="primary" key="home" onClick={() => navigate('/')}>
                     На главную
                  </Button>,
               ]}
            />
         )}
      </div>
   )
}

export default PaymentResultPage
