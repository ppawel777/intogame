import { Collapse } from 'antd'

import s from './Rules.module.scss'

export const Rules = () => {
   return (
      <Collapse
         defaultActiveKey={[]}
         // style={{ marginTop: '16px' }}
         className={s.playerCollapse}
         ghost
         items={[
            {
               key: '1',
               label: 'Условия бронирования и оплаты',
               children: <>Условия бронирования и оплаты</>,
            },
         ]}
      />
   )
}
