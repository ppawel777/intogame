import { Badge, Radio } from 'antd'

type GameStatusFilterProps = {
   value: string
   onChange: (value: string) => void
   size?: 'small' | 'middle' | 'large'
}

export const GameStatusFilter = ({ value, onChange, size = 'middle' }: GameStatusFilterProps) => {
   return (
      <Radio.Group value={value} onChange={(e) => onChange(e.target.value)} size={size}>
         <Radio.Button value="Все">Все</Radio.Button>
         <Radio.Button value="Активна">
            <Badge status="success" text="Активна" />
         </Radio.Button>
         <Radio.Button value="Завершена">
            <Badge status="default" text="Завершена" />
         </Radio.Button>
         <Radio.Button value="Отменена">
            <Badge status="error" text="Отменена" />
         </Radio.Button>
      </Radio.Group>
   )
}
