export function formatCents(cents) {
  let str = cents.toString().padStart(2, '0')
  str = `${str.substr(0, str.length - 2).padStart(1, '0')}.${str.substr(
    str.length - 2
  )}`
  return str
}

const dateFormat = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})
export function formatDate(date) {
  return dateFormat.format(date)
}
