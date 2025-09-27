import './index.scss'

const _403 = () => {
   return (
      <section className="error-page__wrap">
         <span className="error-page__header">Доступ запрещен</span>
         <span className="error-page__code-text">код ошибки: 403</span>
         <span className="error-page__code-desc"></span>
         <span className="error-page__action">
            Если проблема повторяется, <a href="#">сообщите нам</a>об этом
         </span>
      </section>
   )
}

export default _403
