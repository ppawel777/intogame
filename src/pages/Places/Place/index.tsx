import { Button, Image } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import place_example from '@img/place_example.jpg'

import s from './index.module.scss'

const Place = () => {
   const params = useParams()
   const navigate = useNavigate()

   const { initId } = params || {}

   return (
      <div className={s.wrapPlace}>
         <Button type="primary" onClick={() => navigate(-1)} className={s.buttonBack}>
            Назад
         </Button>
         <div>Футбольное поле {initId}</div>
         <Image src={place_example} preview={false} />
      </div>
   )
}

export default Place
