import React from 'react'

import './index.scss'

const _400 = () => {
   return (
      <section className="error-page__wrap">
         <span className="error-page__header">Ошибка на странице</span>
         <span className="error-page__code-text">код ошибки: 400</span>
         <span className="error-page__code-desc">Попробуйте обновить страницу позже</span>
         <span className="error-page__action">
            Если проблема повторяется, <a href="#">сообщите нам</a>об этом
         </span>
      </section>
   )
}

export default _400
