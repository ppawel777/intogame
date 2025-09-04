import { useEffect, useState } from 'react'
import { supabase } from '@supabaseDir/supabaseClient'
import { DatePicker, Form, FormProps, InputNumber, Select, TimePicker, message } from 'antd'
import dayjs from 'dayjs'
import { formatDate, formatTime } from '../gameComponentHelpers'

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
         span: 10,
      },
   }

   return (
      <Form {...layout} form={form} name="create_game" initialValues={initialValues}>
         <Form.Item name="place_id" label="Площадка">
            <Select options={placeList} loading={loading} />
         </Form.Item>
         <Form.Item name="game_date" label="Дата проведения">
            <DatePicker
               placeholder="Выберите дату"
               format={formatDate}
               disabledDate={(current) => {
                  const customDate = dayjs().format(formatDate)
                  return current && current < dayjs(customDate, formatDate)
               }}
            />
         </Form.Item>
         <Form.Item name="game_time" label="Время проведения">
            <TimePicker.RangePicker format={formatTime} />
         </Form.Item>
         <Form.Item name="game_price" label="Цена игры, руб.">
            <InputNumber />
         </Form.Item>
         <Form.Item name="players_limit" label="Допустимое число игроков">
            <InputNumber />
         </Form.Item>
         {!isCreate && (
            <Form.Item name="is_active" label="Статус игры">
               <Select
                  options={[
                     { label: 'Активна', value: true },
                     { label: 'Закрыта', value: false },
                  ]}
               />
            </Form.Item>
         )}
      </Form>
   )
}

export default FormComponent
