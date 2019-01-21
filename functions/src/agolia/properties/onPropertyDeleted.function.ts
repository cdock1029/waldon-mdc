import { functions, admin } from '../../globalDeps'
import { index } from '../algoliaDeps'

exports = module.exports = functions.firestore
  .document('companies/{companyId}/properties/{propertyId}')
  .onDelete(async (snap, context) => {
    // subtract from count
    await admin.firestore().runTransaction(async txn => {
      const companyRef = snap.ref.parent.parent!
      const companySnap = await txn.get(companyRef)
      const company = companySnap.data()

      if (!company || company.lastChangeEvent === context.eventId) {
        return
      }

      return txn.update(companyRef, {
        propertyCount: company.propertyCount - 1,
        lastChangeEvent: context.eventId,
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
