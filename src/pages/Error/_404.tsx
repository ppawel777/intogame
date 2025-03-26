import React from 'react'
import { useNavigate } from 'react-router-dom'

import './index.scss'

const _404: React.FC = () => {
   const navigate = useNavigate()

   return (
      <section className="error-page__wrap">
         <span className="error-page__header">Страница не найдена</span>
         <span className="error-page__code-text">код ошибки: 404</span>
         <span className="error-page__code-desc">В адресе есть ошибка или страница удалена</span>
         <span className="error-page__action">
            <a href="#" onClick={() => navigate(-1)}>
               Вернуться назад
            </a>
         </span>
      </section>
   )
}

export default _404
