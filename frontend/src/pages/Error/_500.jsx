import './index.scss'

const _500 = () => {
   return (
      <section className="error-page__wrap">
         <span className="error-page__header">Сервис недоступен</span>
         <span className="error-page__code-text">код ошибки: 500</span>
         <span className="error-page__code-desc">
            Мы знаем о проблеме и работаем над её решением. Извините за неудобства
         </span>
         <span className="error-page__action">
            Если проблема повторяется, <a href="#">сообщите нам</a>об этом
         </span>
      </section>
   )
}

export default _500
