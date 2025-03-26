import React from 'react'
import { Alert, Button, Collapse } from 'antd'
import type { CollapseProps } from 'antd'

import './index.scss'

interface IProps {
   errorMessage: string
   errorDetail: string
}
const ErrorTemplate: React.FC<IProps> = ({ errorMessage, errorDetail }) => {
   const items: CollapseProps['items'] = [
      {
         key: '1',
         label: <span className="error-page__collapse-header">Детальнее</span>,
         children: <pre>{errorDetail}</pre>,
      },
   ]
   return (
      <section className="error-page__wrap">
         <span className="error-page__header">Ошибка на странице</span>
         <span className="error-page__code-text">
            Возникла критическая ошибка на странице. Пожалуйста, сообщите администратору
         </span>
         <span className="error-page__code-desc"></span>
         <span className="error-page__action">
            <Alert
               message={errorMessage}
               showIcon
               description={<Collapse ghost items={items} className="error-page__collapse" />}
               type="error"
               action={
                  <Button size="small" danger>
                     Отправить администратору
                  </Button>
               }
            />
         </span>
      </section>
   )
}

export default ErrorTemplate
