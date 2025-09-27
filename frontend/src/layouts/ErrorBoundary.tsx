import { Component } from 'react'
import ErrorTemplate from '../pages/Error/ErrorTemplate'

interface IState {
   hasError?: boolean
   errorMessage?: string
   errorDetail?: string
}
interface Error {
   stack?: string
}

class ErrorBoundary extends Component<any, any> {
   constructor(props: IState) {
      super(props)

      this.state = {
         hasError: false,
         errorMessage: '',
         errorDetail: '',
      }
   }

   static getDerivedStateFromError(error: Error) {
      return {
         hasError: true,
         errorMessage: String(error),
      }
   }

   componentDidCatch(_: Error, errorInfo: React.ErrorInfo) {
      this.setState({ errorDetail: errorInfo.componentStack })
   }

   render() {
      if (this.state.hasError) {
         return <ErrorTemplate errorMessage={this.state.errorMessage} errorDetail={this.state.errorDetail} />
      }

      return this.props.children
   }
}

export default ErrorBoundary
