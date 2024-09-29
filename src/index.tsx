import * as React from 'react'
import promiseAllProperties from 'promise-all-properties'

type PromisableValue<T> = T | Promise<T>

type RawController<ControllerProps, ReturnProps> = (
  arg: ControllerProps
) => PromisableValue<
  | { [key in keyof ReturnProps]: PromisableValue<ReturnProps[key]> }
  | null
  | undefined
>

export type CreateWidgetType<
  ComponentProps,
  ControllerProps = object | undefined
> = {
  view?: React.ElementType<ComponentProps>
  controller: RawController<ControllerProps, ComponentProps>
  name: string
  errorView?: React.ElementType<{ errorInfo: { description: string } }>
  pendingView?: React.ElementType<{}>
}

type State<Result> = {
  isPromised: boolean
  result: Result
  isError: boolean
  showNothing: boolean
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; name: string },
  { err: boolean }
> {
  state = { err: false }
  componentDidCatch = (error: Error) => {
    console.log(`Widget: ${this.props.name} failed by`, { error })
    this.setState({ err: true })
  }

  render() {
    return this.state.err ? (
      <React.Fragment />
    ) : (
      <React.Fragment>{this.props.children}</React.Fragment>
    )
  }
}

class CreateWidget<ComponentProps, ControllerProps> extends React.PureComponent<
  CreateWidgetType<ComponentProps, ControllerProps> & {
    controllerProps: ControllerProps
  },
  State<ComponentProps>
> {
  state = {
    isPromised: false,
    result: {} as ComponentProps,
    isError: false,
    showNothing: false
  }

  async componentDidMount() {
    if (this.props.view) {
      try {
        const resultObject = await this.props.controller(
          this.props.controllerProps
        )
        if (resultObject === null || resultObject === undefined) {
          this.setState({
            ...this.state,
            showNothing: true
          })
          return
        }
        const result = await promiseAllProperties<typeof resultObject>(
          resultObject
        )
        this.setState({
          ...this.state,
          result: result as ComponentProps,
          isPromised: true
        })
      } catch (error) {
        console.log(`Widget: ${this.props.name} failed by`, { error })
        this.setState({
          ...this.state,
          isError: true,
          isPromised: false
        })
      }
    } else {
      this.setState({
        ...this.state,
        showNothing: true,
        isPromised: false
      })
    }
  }

  render() {
    if (this.state.isError && this.props.errorView) {
      const ErrorView = this.props.errorView as React.FC
      return <ErrorView />
    }
    if (this.state.showNothing) {
      return null
    }
    if (this.state.isPromised) {
      const View = this.props.view as React.FC<ComponentProps>

      return (
        <div data-name={this.props.name}>
          <View {...this.state.result} />
        </div>
      )
    }
    if (
      this.props.pendingView &&
      !this.state.isPromised &&
      !this.state.isError
    ) {
      const PendingView = this.props.pendingView as React.FC
      return <PendingView />
    }
    return null
  }
}

export function createWidget<ComponentProps, ControllerProps>(
  props: CreateWidgetType<ComponentProps, ControllerProps>
) {
  return (controllerProps: ControllerProps) => (
    <ErrorBoundary name={props.name}>
      <CreateWidget {...props} controllerProps={controllerProps} />
    </ErrorBoundary>
  )
}
