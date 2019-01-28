import { functions, admin } from '../globalDeps'

exports = module.exports = functions.firestore
  .document('companies/{companyId}/properties/{propertyId}/units/{unitId}')
  .onCreate(async (snap, context) => {
    return admin.firestore().runTransaction(async txn => {
      // increment unit count
      const unitId = snap.id

      const propertyRef = snap.ref.parent.parent!

      const propertySnap = await txn.get(propertyRef)

      const property = propertySnap.data()! as {
        counterIncIds?: string[]
        unitCount?: number
      }

      let counterIncIds = property.counterIncIds || []

      if (counterIncIds && counterIncIds.includes(unitId)) {
        console.log(
          `unit count increase already handled. eventId=[${
            context.eventId
          }] unitId=[${unitId}]`
        )
        return
      }

      if (counterIncIds.length >= 5) {
        counterIncIds = counterIncIds.slice(-4)
      }

      const unitCount = property.unitCount || 0

      return Promise.all([
        txn.update(propertyRef, {
          unitCount: unitCount + 1,
          counterIncIds: [...counterIncIds, unitId],
        }),
      ])
    })
  })
