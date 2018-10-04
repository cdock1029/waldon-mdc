import { componentFromStream } from 'recompose'
import { map, switchMap } from 'rxjs/operators'
import { authCollection } from './firebase'

export const Collection = componentFromStream(props$ => {
  const result$ = props$.pipe(
    switchMap(({ path, options, children }) =>
      authCollection(path, options).pipe(map(data => children({ data })))
    )
  )
  return result$
})
