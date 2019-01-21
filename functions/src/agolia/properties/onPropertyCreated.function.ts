import { functions, admin } from '../../globalDeps'
import { index } from '../algoliaDeps'

exports = module.exports = functions.firestore
  .document('companies/{companyId}/properties/{propertyId}')
  .onCreate(async (snap, context) => {
    // add to property count
    await admin.firestore().runTransaction(async txn => {
      const companyRef = snap.ref.parent.parent!
      const companySnap = await txn.get(companyRef)
      const company = companySnap.data()

      if (!company || company.lastChangeEvent === context.eventId) {
        console.log('company does not exist:', context.params.companyId)
        return
      }

      const propertyCount = company.propertyCount || 0

      return txn.update(companyRef, {
        propertyCount: propertyCount + 1,
        lastChangeEvent: context.eventId,
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
