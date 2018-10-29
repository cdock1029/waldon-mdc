import { useState, useEffect } from 'react'
import { authDoc } from './index'

export function useDoc({ path }) {
  const [data, setData] = useState(null)
  useEffect(
    () => {
      const sub = authDoc(path).subscribe(setData)
      return () => {
        sub.unsubscribe()
      }
    },
    [path]
  )
  return data
}
