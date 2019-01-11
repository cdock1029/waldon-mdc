import DineroJS from 'dinero.js'
export const Dinero = DineroJS

Dinero.globalLocale = 'en-US'

export function addToBalance(balance: number, amount: number): number {
  const result = Dinero({ amount: balance }).add(Dinero({ amount }))
  return result.getAmount()
}

export function subtractFromBalance(balance: number, amount: number): number {
  const result = Dinero({ amount: balance }).subtract(Dinero({ amount }))
  return result.getAmount()
}
