import { Flex, Tag } from 'antd'

type CardExtraProps = {
   confirmedCount: number
   playersLimit: number | null
}

export const CardExtra = ({ confirmedCount, playersLimit }: CardExtraProps) => {
   const isFull = playersLimit ? confirmedCount >= playersLimit : false

   return (
      <Flex vertical justify="center" align="center" gap={16}>
         <Tag color={isFull ? 'error' : 'success'}>{isFull ? 'Мест нет' : 'Есть места'}</Tag>
      </Flex>
   )
}
