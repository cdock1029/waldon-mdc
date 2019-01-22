import { useState } from 'react'
export function useInput(name, initial = '') {
  const [value, setValue] = useState(initial)

  function handleChange(e) {
    const { value } = e.target
    setValue(value)
  }

  return {
    input: (params = {}) => ({
      name,
      value,
      onChange: handleChange,
      type: 'text',
      ...params,
    }),
    value,
    reset() {
      setValue(initial)
    },
  }
}
