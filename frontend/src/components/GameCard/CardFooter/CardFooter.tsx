import { RightOutlined } from '@ant-design/icons'
import { Flex, Row, Space } from 'antd'

import s from './CardFooter.module.scss'

type CardFooterProps = {
   players_min: number | null
   game_price: number | null
}

const CardFooter = ({ players_min, game_price }: CardFooterProps) => {
   return (
      <Row className={s.footer}>
         <Flex justify="space-between" align="center" style={{ width: '100%' }}>
            <p className={s.price}>
               {players_min && players_min > 0 && game_price ? Math.ceil(game_price / players_min) : '—'} ₽
            </p>
            <Space size="small">
               <span>Подробнее</span>
               <RightOutlined style={{ fontSize: 12 }} />
            </Space>
         </Flex>
      </Row>
   )
}

export default CardFooter
