import { functions } from '../../globalDeps'
import { index } from '../algoliaDeps'
import { PROPERTY } from './deps'

exports = module.exports = functions.firestore
  .document(PROPERTY)
  .onDelete(async (snap, context) => {
    try {
      await index().deleteObject(snap.id)
      return true
    } catch (e) {
      console.error(
        `Error deleting Property=[${snap.id}] on algolia: ${e.message}`,
      )
      return false
    }
  })
