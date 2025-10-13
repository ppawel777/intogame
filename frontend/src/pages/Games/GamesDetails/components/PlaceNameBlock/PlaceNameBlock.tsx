import { EnvironmentOutlined } from '@ant-design/icons'

import { Flex, Space } from 'antd'
import s from './PlaceNameBlock.module.scss'
import { MapButton } from '@components/MapButton'

type Props = {
   place_name: string
   place_address: string
}

export const PlaceNameBlock = ({ place_name, place_address }: Props) => {
   return (
      <Flex vertical gap={16}>
         <Flex justify="space-between" align="center">
            <Space size="middle">
               <EnvironmentOutlined style={{ fontSize: '24px' }} />
               <Flex vertical>
                  <p className={s.placeName}>{place_name}</p>
                  <p className={s.placeAddress}>{place_address}</p>
               </Flex>
            </Space>
            <MapButton address={place_address} />
         </Flex>
      </Flex>
   )
}
