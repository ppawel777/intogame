import { Badge, Button, Dropdown, MenuProps, Radio } from 'antd'
import { FilterOutlined } from '@ant-design/icons'
import { useIsMobile } from '@utils/hooks/useIsMobile'

type GameStatusFilterProps = {
   value: string
   onChange: (value: string) => void
   size?: 'small' | 'middle' | 'large'
}

export const GameStatusFilter = ({ value, onChange, size = 'middle' }: GameStatusFilterProps) => {
   const isMobile = useIsMobile()

   const menuItems: MenuProps['items'] = [
      {
         key: 'Все',
         label: 'Все',
         onClick: () => onChange('Все'),
      },
      {
         key: 'Активна',
         label: <Badge status="success" text="Активна" />,
         onClick: () => onChange('Активна'),
      },
      {
         key: 'Завершена',
         label: <Badge status="default" text="Завершена" />,
         onClick: () => onChange('Завершена'),
      },
      {
         key: 'Отменена',
         label: <Badge status="error" text="Отменена" />,
         onClick: () => onChange('Отменена'),
      },
   ]

   if (isMobile) {
      return (
         <Dropdown menu={{ items: menuItems, selectedKeys: [value] }} trigger={['click']}>
            <Button icon={<FilterOutlined />} size={size}>
               {value}
            </Button>
         </Dropdown>
      )
   }

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
