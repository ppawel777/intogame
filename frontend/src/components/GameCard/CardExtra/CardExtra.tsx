import { Flex } from 'antd'
import { GameStatusTag } from './GameStatusTag'

type CardExtraProps = {
   confirmedCount: number
   playersLimit: number | null
   isActive: boolean
   gameStatus: string | null
}

export const CardExtra = ({ confirmedCount, playersLimit, isActive, gameStatus }: CardExtraProps) => {
   const isFull = playersLimit ? confirmedCount >= playersLimit : false

   return (
      <Flex vertical justify="center" align="center" gap={16}>
         <GameStatusTag isFull={isFull} isActive={isActive} gameStatus={gameStatus} />
      </Flex>
   )
}
