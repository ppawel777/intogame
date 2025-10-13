import { Button } from 'antd'
import { CompassOutlined } from '@ant-design/icons'
import s from './MapButton.module.scss'

type Props = {
   address?: string
}

export const MapButton = ({ address }: Props) => {
   const handleMapClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (address) {
         const encodedAddress = encodeURIComponent(address)
         window.open(`https://yandex.ru/maps/?text=${encodedAddress}`, '_blank')
      }
   }

   return (
      <Button type="link" icon={<CompassOutlined />} onClick={handleMapClick} className={s.mapButton}>
         Карта
      </Button>
   )
}
