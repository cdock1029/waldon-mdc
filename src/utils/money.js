export function formatCents(cents) {
  let str = cents.toString().padStart(2, '0')
  str = `$ ${str.substr(0, str.length - 2)}.${str.substr(str.length - 2)}`
  return str
}
