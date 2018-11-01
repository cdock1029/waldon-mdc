import { useState, useEffect } from 'react'

function setUp({ defaultValue, key, transform }) {
  const initial = localStorage.getItem(key)
  const val = initial === null ? defaultValue : initial
  const transformed = transform(val)
  return transformed
}

export function useLocalStorage({
  key,
  defaultValue = null,
  transform = i => i,
}) {
  const [value, setValue] = useState(setUp({ defaultValue, key, transform }))
  useEffect(
    () => {
      localStorage.setItem(key, value)
    },
    [value]
  )
  return [value, setValue]
}
