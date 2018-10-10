import React from 'react'
import { componentFromStream } from 'recompose'
import { map, switchMap } from 'rxjs/operators'
import { BehaviorSubject } from 'rxjs'
import { createSubscription } from 'create-subscription'
import { authCollection } from './index'

export const Collection = componentFromStream(props$ => {
  const result$ = props$.pipe(
    switchMap(({ path, options, children }) =>
      authCollection({ path, options }).pipe(map(data => children({ data })))
    )
  )
  return result$
})

const BehaviorSubscription = createSubscription({
  getCurrentValue: behaviorSubject => behaviorSubject.getValue(),
  subscribe: (behaviorSubject, callback) => {
    const subscription = behaviorSubject.subscribe(callback)
    return () => subscription.unsubscribe()
  },
})

export function createCollectionContext() {
  const { Provider, Consumer } = React.createContext()
  return {
    CollectionProvider: class CollectionProvider extends React.Component {
      constructor(props) {
        super(props)
        this.behaviorSubject = new BehaviorSubject([])
      }
      componentDidMount() {
        const { path, options } = this.props
        this.subscription = authCollection({ path, options }).subscribe(
          value => {
            this.behaviorSubject.next(value)
          }
        )
      }
      componentWillUnmount() {
        this.subscription.unsubscribe()
      }
      render() {
        const { children } = this.props
        return (
          <BehaviorSubscription source={this.behaviorSubject}>
            {data => <Provider value={data} children={children} />}
          </BehaviorSubscription>
        )
      }
    },
    CollectionConsumer: Consumer,
  }
}

const PropertiesContext = createCollectionContext()
const TenantsContext = createCollectionContext()

export const PropertiesProvider = ({ children }) => (
  <PropertiesContext.CollectionProvider
    path="properties"
    children={children}
    options={{ orderBy: ['name'] }}
  />
)
export const PropertiesConsumer = PropertiesContext.CollectionConsumer

export const TenantsProvider = ({ children }) => (
  <TenantsContext.CollectionProvider path="tenants" children={children} />
)
export const TenantsConsumer = TenantsContext.CollectionConsumer
