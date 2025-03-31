import { LikeOutlined, MessageOutlined, StarOutlined } from '@ant-design/icons'
import { Input, List, Skeleton, Space, message } from 'antd'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@supabaseDir/supabaseClient'

import s from './index.module.scss'

const IconText = ({ icon, text }: { icon: React.FC; text: string }) => (
   <Space>
      {React.createElement(icon)}
      {text}
   </Space>
)

const PlacesList = () => {
   const [loading, setLoading] = useState(false)
   const [placesData, setPlacesData] = useState<any[]>([])

   useEffect(() => {
      const getPlaces = async () => {
         setLoading(true)
         try {
            const { data, error } = await supabase.from('places').select('*').eq('is_active', true)
            if (error) throw error
            data.length && setPlacesData(data)
         } catch (error: any) {
            message.error(error.message)
         } finally {
            setLoading(false)
         }
      }

      getPlaces()
   }, [])

   return (
      <div className={s.wrapContent}>
         <Input className={s.inputSearch} placeholder="Поиск" />
         {loading ? (
            <Skeleton active />
         ) : (
            <List
               className={s.wrapList}
               itemLayout="vertical"
               size="large"
               // loading={loading}
               pagination={{
                  onChange: (page) => {
                     console.log(page)
                  },
                  pageSize: 2,
               }}
               dataSource={placesData}
               renderItem={(item) => (
                  <List.Item
                     key={item.id}
                     actions={[
                        <IconText icon={StarOutlined} text="156" key="list-vertical-star-o" />,
                        <IconText icon={LikeOutlined} text="156" key="list-vertical-like-o" />,
                        <IconText icon={MessageOutlined} text="2" key="list-vertical-message" />,
                     ]}
                     extra={<img width={272} alt="logo" src={item.photo_link} />}
                  >
                     <List.Item.Meta title={<Link to={`${item.id}/`}>{item.name}</Link>} description={item.phone} />
                     <>
                        <p>{item.description}</p>
                        <p className="mt-14">
                           {item.address}{' '}
                           <a href="https://yandex.ru/maps/-/CHRCZN~B" target="_blank" rel="noreferrer">
                              Карта
                           </a>
                        </p>
                        <p>
                           <a href={item.site_url}>{item.site_url}</a>
                        </p>
                     </>
                  </List.Item>
               )}
            />
         )}
      </div>
   )
}

export default PlacesList
