import React, { useState, useEffect } from 'react'
import { BehaviorSubject, from } from 'rxjs'
import { take, skip, startWith } from 'rxjs/operators'
import { css } from 'react-emotion/macro'
import { collectionData } from 'rxfire/firestore'
import { formatDate } from '../utils/format'
import firebase from '../firebase'

/* serialize params and cache refs, return existing etc.*/
function createFirestoreCollectionResource(ref) {
  const obs = collectionData(ref, 'id')
  // todo ?
  let rootSub
  const bs = new BehaviorSubject(
    new Promise(resolve => {
      rootSub = obs.subscribe(data => {
        bs.next(data)
        rootSub.unsubscribe()
        rootSub = obs.subscribe(restOfData => {
          bs.next(restOfData)
        })
        resolve(data)
        console.log('first callback')
      })
    })
  )

  return function useCollection() {
    console.log('inside useCollection..')
    const [data, setData] = useState(bs.getValue())
    if (data instanceof Promise) {
      throw data
    }
    useEffect(
      () => {
        const sub = bs.subscribe(data => {
          console.log('effect sub callback -> setData(..)')
          setData(data)
        })
        return () => {
          sub.unsubscribe()
        }
      },
      [ref]
    )
    return data
  }
}

const useCollection = createFirestoreCollectionResource(
  firebase
    .firestore()
    .collection('todos')
    .orderBy('createdAt', 'asc')
)
export function TestFirestoreLoader() {
  const todos = useCollection()
  return (
    <div>
      <h3>todo firestore pagination loader</h3>
      <div>
        <ul>
          {todos.map(todo => (
            <Todo key={todo.id} {...todo} />
          ))}
        </ul>
      </div>
    </div>
  )
}

function Todo({ text, completed, createdAt }) {
  return (
    <li>
      <div className={todoStyles}>
        <div>
          <p>{text}</p>
        </div>
        <div>
          <p>{formatDate(createdAt.toDate())}</p>
        </div>
        <div>
          <p>{completed ? 'Done' : 'Not done'}</p>
        </div>
      </div>
    </li>
  )
}

const todoStyles = css`
  display: flex;
  & > div {
    flex: 1;
    display: flex;
    justify-content: center;
    p {
      display: inline-block;
    }
  }
`

export default TestFirestoreLoader
