/* eslint-disable @typescript-eslint/no-unused-vars */
import { Col, Splitter } from 'antd'

import './index.scss'

interface Props {
   list?: React.ReactNode
   content: React.ReactNode
   defaultSize?: string | number
   max?: string | number
   collapsible?: boolean
   leftSideSize?: number | undefined
}

const ContentComponent = (props: Props) => {
   const { content, list = null, defaultSize = '20%', max = '40%', collapsible = true, leftSideSize } = props

   return (
      <section className="wrap-content">
         {list ? (
            <Splitter>
               <Splitter.Panel defaultSize={defaultSize} max={max} collapsible={collapsible} size={leftSideSize}>
                  {list}
               </Splitter.Panel>
               <Splitter.Panel>{content}</Splitter.Panel>
            </Splitter>
         ) : (
            // <Col span={24}>{content}</Col>
            <>{content}</>
         )}
      </section>
   )
}

export default ContentComponent
