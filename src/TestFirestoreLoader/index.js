import React, { memo } from 'react'
import { css } from 'react-emotion/macro'
import { TodosResource } from '../firebase/Collection'
import { formatDate } from '../utils/format'

export function TestFirestoreLoader() {
  const todos = TodosResource.read()

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

const Todo = memo(function _Todo({ text, completed, createdAt }) {
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
})

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
