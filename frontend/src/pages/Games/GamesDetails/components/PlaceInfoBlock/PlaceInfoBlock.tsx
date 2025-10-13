import { Flex, Image } from 'antd'

import profootball1 from '@img/profootball1.jpeg'
import profootball2 from '@img/profootball2.jpeg'
import profootball3 from '@img/profootball3.jpeg'
import profootball4 from '@img/profootball4.jpeg'
import profootball5 from '@img/profootball5.jpeg'
import profootball6 from '@img/profootball6.jpeg'

import s from './PlaceInfoBlock.module.scss'

export const PlaceInfoBlock = () => {
   const images = [profootball1, profootball2, profootball3, profootball4, profootball5, profootball6]

   const data = ['3 обогреваемых поля, размером 40*20 м', '4 раздевалки', 'Душевые', 'Парковка']

   return (
      <Flex vertical gap={16}>
         <Image.PreviewGroup>
            <Flex wrap="wrap" gap={8}>
               {images.map((img, index) => (
                  <Image
                     key={index}
                     src={img}
                     alt={`Место ${index + 1}`}
                     className={s.placeImage}
                     preview={{
                        mask: <div>Посмотреть</div>,
                     }}
                  />
               ))}
            </Flex>
         </Image.PreviewGroup>
         <div className={s.placeInfo}>
            <h3 className={s.placeInfoTitle}>О манеже</h3>
            <ul className={s.placeInfoList}>
               {data.map((item, index) => (
                  <li key={index} className={s.placeInfoItem}>
                     {item}
                  </li>
               ))}
            </ul>
         </div>
      </Flex>
   )
}
