export const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
})

export const sortUnits = uns =>
  uns.sort((a, b) => collator.compare(a.name, b.name))
