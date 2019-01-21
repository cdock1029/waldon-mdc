import { functions } from '../../globalDeps'
import { index } from '../algoliaDeps'

exports = module.exports = functions.firestore
  .document('companies/{companyId}/properties/{propertyId}')
  .onUpdate(async (change, context) => {
    const data = { ...change.after.data(), objectID: change.after.id }
    try {
      await index().partialUpdateObject(data)
      return true
    } catch (e) {
      console.log(`Error updating Property=[${change.after.id}]: ${e.message}`)
      return false
    }
  })
