import { useEffect, useState } from 'react'
import { supabase } from '@supabaseDir/supabaseClient'
import { DatePicker, Form, FormProps, Input, InputNumber, Select, TimePicker, message } from 'antd'
import dayjs from 'dayjs'
import { formatDate, formatTime } from '@utils/formatDatetime'

type Props = {
   form: any
   initialValues: any
   isCreate?: boolean
}

const FormComponent = ({ form, initialValues, isCreate = false }: Props) => {
   const [placeList, setPlaceList] = useState<any[]>([])
   const [loading, setLoading] = useState(false)

   useEffect(() => {
      const getPlaces = async () => {
         setLoading(true)
         try {
            const { data, error } = await supabase.from('places').select('*').eq('is_active', true)
            if (error) throw error
            const result = data.map((item) => ({ value: item.id, label: item.name }))
            data.length && setPlaceList(result)
         } catch (error: any) {
            message.error(error.message)
         } finally {
            setLoading(false)
         }
      }

      getPlaces()
   }, [])

   const layout: FormProps = {
      colon: false,
      labelAlign: 'left',
      labelCol: {
         span: 4,
      },
      wrapperCol: {
         span: 6,
      },
   }

   return (
      <Form {...layout} form={form} name="create_game" initialValues={initialValues}>
         <Form.Item name="place_id" label="Площадка/Манеж">
            <Select placeholder="Выберите площадку" options={placeList} loading={loading} />
         </Form.Item>
         <Form.Item name="game_date" label="Дата проведения">
            <DatePicker
               placeholder="Выберите дату"
               format={formatDate}
               disabledDate={(current) => {
                  const customDate = dayjs().format(formatDate)
                  return current && current < dayjs(customDate, formatDate)
               }}
               style={{ width: '100%' }}
            />
         </Form.Item>
         <Form.Item name="game_time" label="Время проведения">
            <TimePicker.RangePicker format={formatTime} style={{ width: '100%' }} />
         </Form.Item>
         <Form.Item name="game_price" label="Общая стоимость игры, руб.">
            <InputNumber />
         </Form.Item>
         <Form.Item name="players_min" label="Минимальное число игроков">
            <InputNumber />
         </Form.Item>
         <Form.Item name="players_limit" label="Допустимое число игроков">
            <InputNumber />
         </Form.Item>
         <Form.Item name="additional_notes" label="Доп. условия">
            <Input.TextArea placeholder="Напишите доп. условия, которые будут отображаться на странице игры" />
         </Form.Item>
         {!isCreate && (
            <Form.Item name="game_status" label="Статус игры">
               <Select
                  options={[
                     { label: 'Активна', value: 'Активна' },
                     { label: 'Завершена', value: 'Завершена' },
                     { label: 'Отменена', value: 'Отменена' },
                     // { label: 'Перенесена', value: 'Перенесена' },
                  ]}
               />
               {/* <Select
                  options={[
                     { label: 'Активна', value: true },
                     { label: 'Закрыта', value: false },
                  ]}
               /> */}
            </Form.Item>
         )}
      </Form>
   )
}

export default FormComponent
