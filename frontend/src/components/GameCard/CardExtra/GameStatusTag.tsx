import { Tag, Tooltip } from 'antd'
import { WarningOutlined } from '@ant-design/icons'
import { Flex } from 'antd'

type GameStatusTagProps = {
   isFull: boolean
   isActive: boolean
   gameStatus: string | null
}

export const GameStatusTag = ({ isFull, isActive, gameStatus }: GameStatusTagProps) => {
   if (!isActive && gameStatus) {
      return <Tag color="default">{gameStatus}</Tag>
   }

   const tagContent = (
      <Flex vertical align="center" gap={4}>
         <span>Идет набор</span>
         {isFull && <WarningOutlined />}
      </Flex>
   )

   if (isFull) {
      return (
         <Tooltip title="Команда полностью укомплектована, но можно встать в резерв на случай, если кто-то откажется">
            <Tag color={isFull ? 'error' : 'success'}>{tagContent}</Tag>
         </Tooltip>
      )
   }

   return <Tag color="success">{tagContent}</Tag>
}
