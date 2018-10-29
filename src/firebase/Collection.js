import React, { useState, useEffect } from 'react'
import { BehaviorSubject } from 'rxjs'
import { createSubscription } from 'create-subscription'
import { authCollection } from './index'

export function Collection({ path, options, children }) {
  const [data, setData] = useState(null)
  useEffect(
    () => {
      console.log('running effect')
      const sub = authCollection({ path, options }).subscribe(setData)
      return () => {
        sub.unsubscribe()
      }
    },
    [path, JSON.stringify(options)]
  )
  return data ? children({ data }) : null
}
export function useCollection({ path, options }) {
  const [data, setData] = useState(null)
  useEffect(
    () => {
      console.log('running effect')
      const sub = authCollection({ path, options }).subscribe(setData)
      return () => {
        sub.unsubscribe()
      }
    },
    [path, JSON.stringify(options)]
  )
  return data
}

const BehaviorSubscription = createSubscription({
  getCurrentValue: behaviorSubject => behaviorSubject.getValue(),
  subscribe: (behaviorSubject, callback) => {
    const subscription = behaviorSubject.subscribe(callback)
    return () => subscription.unsubscribe()
  },
})

export function createCollectionContext() {
  const RootContext = React.createContext()
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
            {data => {
              console.log({ contextData: data })
              return <RootContext.Provider value={data} children={children} />
            }}
          </BehaviorSubscription>
        )
      }
    },
    CollectionConsumer: RootContext.Consumer,
    RootContext,
  }
}

const PropertiesContextWrapper = createCollectionContext()
export const PropertiesContext = PropertiesContextWrapper.RootContext

const TenantsContextWrapper = createCollectionContext()
export const TenantsContext = TenantsContextWrapper.RootContext

export const PropertiesProvider = ({ children }) => (
  <PropertiesContextWrapper.CollectionProvider
    path="properties"
    children={children}
    options={{ orderBy: ['name'] }}
  />
)
export const PropertiesConsumer = PropertiesContextWrapper.CollectionConsumer

export const TenantsProvider = ({ children }) => (
  <TenantsContextWrapper.CollectionProvider
    path="tenants"
    children={children}
  />
)
export const TenantsConsumer = TenantsContextWrapper.CollectionConsumer
