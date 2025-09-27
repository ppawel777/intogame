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
   const { content } = props

   return <section className="wrap-content">{content}</section>
}

export default ContentComponent
