import { useState, useEffect, useContext } from 'react'
import { AuthContext } from './Auth'
import { authDoc } from './index'

export function useDoc({ path }) {
  const [data, setData] = useState(null)
  const { claims } = useContext(AuthContext)
  useEffect(
    () => {
      if (claims) {
        const sub = authDoc({
          path,
          activeCompany: claims.activeCompany,
        }).subscribe(setData)
        return () => {
          sub.unsubscribe()
        }
      }
    },
    [path, claims]
  )
  return data
}
