import { Button } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
// import place_example from '@img/place_example.jpg'

import s from './Place.module.scss'

const PlacePage = () => {
   const params = useParams()
   const navigate = useNavigate()

   const { initId } = params || {}

   return (
      <div>
         <Button type="primary" onClick={() => navigate(-1)} className={s.buttonBack}>
            Назад
         </Button>
         <div>Футбольное поле {initId}</div>
         {/* <Image src={place_example} preview={false} /> */}
      </div>
   )
}

export default PlacePage
