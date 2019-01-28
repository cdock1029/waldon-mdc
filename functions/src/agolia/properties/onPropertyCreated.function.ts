import { functions, admin } from '../../globalDeps'
import { index } from '../algoliaDeps'

exports = module.exports = functions.firestore
  .document('companies/{companyId}/properties/{propertyId}')
  .onCreate(async (snap, context) => {
    // add to property count
    await admin.firestore().runTransaction(async txn => {
      const propertyId = snap.id
      const companyRef = snap.ref.parent.parent!
      const companySnap = await txn.get(companyRef)
      const company = companySnap.data()! as {
        counterIncIds?: string[]
        propertyCount?: number
      }

      let counterIncIds = company.counterIncIds || []

      if (counterIncIds.includes(propertyId)) {
        console.log(
          `Property increment already handled. propertyId=[${propertyId}] eventId=[${
            context.eventId
          }]`
        )
        return
      }

      if (counterIncIds.length >= 5) {
        counterIncIds = counterIncIds.slice(-4)
      }

      const propertyCount = company.propertyCount || 0

      return txn.update(companyRef, {
        propertyCount: propertyCount + 1,
        counterIncIds: [...counterIncIds, propertyId],
      })
    })

    const property = {
      objectID: snap.id,
      ...snap.data(),
      companyId: context.params.companyId,
    }
    try {
      await index().saveObject(property)
      return true
    } catch (e) {
      console.log(`Error saving Property=[${snap.id}] to algolia:`, e)
      return false
    }
  })
