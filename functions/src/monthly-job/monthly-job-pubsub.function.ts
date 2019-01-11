import { admin, functions } from '../globalDeps'
import { JobStatus } from './monthlyJobDeps'

const fs = admin.firestore()

exports = module.exports = functions.pubsub
  .topic('monthly-job')
  .onPublish((message, context) => {
    // create new job in firestore
    const eventId = context.eventId
    const monthlyJobCollectionRef = fs.collection('monthly-job')
    return fs.runTransaction(async txn => {
      // read for eventId
      const monthlyJobDocRef = monthlyJobCollectionRef.doc(eventId)
      const job = await txn.get(monthlyJobDocRef)

      if (!job.exists) {
        // create the doc
        const monthlyJobData = {
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          status: JobStatus.CREATED,
        }
        return txn.create(monthlyJobDocRef, monthlyJobData)
      }
      return
    })
  })
