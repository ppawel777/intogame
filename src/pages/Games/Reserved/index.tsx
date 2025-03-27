import { Badge, Button, Card, Descriptions, DescriptionsProps, Flex } from 'antd'

import s from './index.module.scss'
import { QuestionCircleOutlined } from '@ant-design/icons'

const Reserved = () => {
   const items: DescriptionsProps['items'] = [
      {
         key: '1',
         label: 'Время игры',
         children: '19:00 - 20:30',
      },
      {
         key: '2',
         label: 'Адрес',
         children: 'мк-н Жилино, ул. Пригородная, 42',
      },
      {
         key: '3',
         label: 'Количество участников',
         children: (
            <Flex justify="space-between">
               <span style={{ fontWeight: 600 }}>8</span>
               <Button>Список</Button>
            </Flex>
         ),
      },
      {
         key: '4',
         label: 'Цена',
         children: '660 руб.',
      },
      {
         key: '5',
         label: 'Условия записи',
         children: (
            <Flex justify="space-between">
               <span>Оплата сразу</span>
               <QuestionCircleOutlined style={{ fontSize: '20px', cursor: 'pointer' }} title="Узнать подробнее" />
            </Flex>
         ),
      },
   ]

   const ExtraText = () => {
      return <Badge status="success" text={<span className={s.extraSuccess}>Есть места</span>} />
   }

   return (
      <div className={s.wrapReserved}>
         <h3>Ближайшие игры</h3>
         <Card title="Про Футбол" extra={<ExtraText />} style={{ width: 550 }}>
            <Descriptions bordered items={items} layout="horizontal" column={1} />
            <Button type="primary" style={{ marginTop: '16px', width: '100%' }}>
               Записаться
            </Button>
         </Card>
      </div>
   )
}
export default Reserved
