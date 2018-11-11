import React, { Suspense } from 'react'
import styled from '@emotion/styled'
import { TodosResource } from '../firebase/Collection'
import { formatDate } from '../utils/format'
import { Spinner } from '../Spinner'

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

const Todo = ({ text, completed, createdAt }) => {
  return (
    <li>
      <StyledTodo>
        <div>
          <p>{text}</p>
        </div>
        <div>
          <p>{formatDate(createdAt.toDate())}</p>
        </div>
        <div>
          <p>{completed ? 'Done' : 'Not done'}</p>
        </div>
      </StyledTodo>
    </li>
  )
}

const StyledTodo = styled.div`
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

export default () => (
  <Suspense fallback={<Spinner />}>
    <TestFirestoreLoader />
  </Suspense>
)
