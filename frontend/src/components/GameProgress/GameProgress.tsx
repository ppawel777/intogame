import { Progress, Tooltip } from 'antd'

type GameProgressProps = {
   confirmedCount: number
   playersLimit: number | null
   size?: 'small' | 'default'
   strokeWidth?: number
   maxWidth?: string
   showTooltip?: boolean
}

export const GameProgress = ({
   confirmedCount,
   playersLimit,
   size = 'small',
   strokeWidth = 20,
   maxWidth = '80%',
   showTooltip = true,
}: GameProgressProps) => {
   const percent = playersLimit ? Math.round((confirmedCount / playersLimit) * 100) : 0
   const isFull = playersLimit && confirmedCount >= playersLimit

   return (
      <Progress
         percent={percent}
         size={size}
         status={isFull ? 'success' : 'active'}
         strokeWidth={strokeWidth}
         style={{ margin: 0, maxWidth }}
         format={
            showTooltip
               ? (percent) => (
                    <Tooltip title={`${confirmedCount} из ${playersLimit || 0}`}>
                       <span style={{ fontSize: '12px' }}>{percent}%</span>
                    </Tooltip>
                 )
               : (percent) => <span style={{ fontSize: '12px' }}>{percent}%</span>
         }
      />
   )
}
