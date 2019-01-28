import { functions, admin } from '../../globalDeps'
import { index } from '../algoliaDeps'

exports = module.exports = functions.firestore
  .document('companies/{companyId}/properties/{propertyId}')
  .onDelete(async (snap, context) => {
    // subtract from count
    await admin.firestore().runTransaction(async txn => {
      const propertyId = snap.id
      const companyRef = snap.ref.parent.parent!
      const companySnap = await txn.get(companyRef)
      const company = companySnap.data()! as {
        counterDecIds?: string[]
        propertyCount?: number
      }

      let counterDecIds = company.counterDecIds || []

      if (counterDecIds.includes(propertyId)) {
        console.log(
          `Property increment already handled. propertyId=[${propertyId}] eventId=[${
            context.eventId
          }]`
        )
        return
      }

      if (counterDecIds.length >= 5) {
        counterDecIds = counterDecIds.slice(-4)
      }

      const propertyCount = company.propertyCount || 0

      return txn.update(companyRef, {
        propertyCount: propertyCount - 1,
        counterDecIds: [...counterDecIds, propertyId],
      })
    })

    try {
      await index().deleteObject(snap.id)
      return true
    } catch (e) {
      console.error(
        `Error deleting Property=[${snap.id}] on algolia: ${e.message}`
      )
      return false
    }
  })
