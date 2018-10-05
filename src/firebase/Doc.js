import { componentFromStream } from 'recompose'
import { map, switchMap } from 'rxjs/operators'
import { authDoc } from './index'

export const Doc = componentFromStream(props$ => {
  const result$ = props$.pipe(
    switchMap(({ path, children }) =>
      authDoc(path).pipe(map(data => children({ data })))
    )
  )
  return result$
})
