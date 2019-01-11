import { functions } from '../../globalDeps'
import { index } from '../algoliaDeps'
import { PROPERTY } from './deps'

export = (module.exports = functions.firestore
  .document(PROPERTY)
  .onCreate(async (snap, context) => {
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
  }))
