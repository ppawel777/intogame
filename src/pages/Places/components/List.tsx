import { LikeOutlined, MessageOutlined, StarOutlined } from '@ant-design/icons'
import { Input, List, Space } from 'antd'
import React from 'react'
import place_example from '@img/place_example.jpg'
import { Link } from 'react-router-dom'

import s from './index.module.scss'

const data = Array.from({ length: 10 }).map((_, i) => ({
   id: i,
   title: `Футбольное поле ${i}`,
   description: 'Краткое описание поля',
   content: 'Полное описание площадки',
}))

const IconText = ({ icon, text }: { icon: React.FC; text: string }) => (
   <Space>
      {React.createElement(icon)}
      {text}
   </Space>
)

const PlacesList = () => {
   return (
      <div className={s.wrapContent}>
         <Input className={s.inputSearch} placeholder="Поиск" />
         <List
            className={s.wrapList}
            itemLayout="vertical"
            size="large"
            pagination={{
               onChange: (page) => {
                  console.log(page)
               },
               pageSize: 2,
            }}
            dataSource={data}
            renderItem={(item) => (
               <List.Item
                  key={item.title}
                  actions={[
                     <IconText icon={StarOutlined} text="156" key="list-vertical-star-o" />,
                     <IconText icon={LikeOutlined} text="156" key="list-vertical-like-o" />,
                     <IconText icon={MessageOutlined} text="2" key="list-vertical-message" />,
                  ]}
                  extra={<img width={272} alt="logo" src={place_example} />}
               >
                  <List.Item.Meta title={<Link to={`${item.id}/`}>{item.title}</Link>} description={item.description} />
                  {item.content}
               </List.Item>
            )}
         />
      </div>
   )
}

export default PlacesList
