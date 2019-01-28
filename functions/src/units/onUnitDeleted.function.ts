import { functions, admin } from '../globalDeps'

exports = module.exports = functions.firestore
  .document('companies/{companyId}/properties/{propertyId}/units/{unitId}')
  .onDelete(async (snap, context) => {
    return admin.firestore().runTransaction(async txn => {
      // decrement unit count
      const unitId = snap.id

      const propertyRef = snap.ref.parent.parent!

      const propertySnap = await txn.get(propertyRef)

      const property = propertySnap.data()! as {
        counterDecIds?: string[]
        unitCount: number
      }

      let counterDecIds = property.counterDecIds || []

      if (counterDecIds && counterDecIds.includes(unitId)) {
        console.log(
          `unit count decrement already handled. eventId=[${
            context.eventId
          }] unitId=[${unitId}]`
        )
        return
      }

      if (counterDecIds.length >= 5) {
        counterDecIds = counterDecIds.slice(-4)
      }

      const unitCount = property.unitCount || 0

      return Promise.all([
        txn.update(propertyRef, {
          unitCount: unitCount - 1,
          counterDecIds: [...counterDecIds, unitId],
        }),
      ])
    })
  })
