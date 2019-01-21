import { admin, functions } from '../globalDeps'
import {
  pubsub,
  initJob,
  markJobComplete,
  retryTimedOut,
  MONTHLY_JOB,
  MONTHLY_COMPANY_JOB,
} from './monthlyJobDeps'

/*
  Job: publish message for each company
  success: when all messages published
*/

exports = module.exports = functions.pubsub
  .topic(MONTHLY_JOB)
  .onPublish((message, { eventId, timestamp }) => {
    // quit if exceeded retry threshold
    if (retryTimedOut({ timestamp })) {
      console.log(
        `Dropping event ${eventId} for job ${MONTHLY_JOB}. timestamp=[${timestamp}]`
      )
      return
    }

    const monthlyJobRef = admin
      .firestore()
      .collection(MONTHLY_JOB)
      .doc(eventId)

    // try to reserve job lease if not taken...
    return initJob(monthlyJobRef).then(async (shouldPublish: boolean) => {
      if (shouldPublish) {
        // job lease reserved. Doing work
        const publisher = pubsub.topic(MONTHLY_COMPANY_JOB).publisher()
        const promises: Promise<any>[] = []

        const companyIds: string[] = await admin
          .firestore()
          .collection('companies')
          .get()
          .then(snap => snap.docs.map(doc => doc.id))

        companyIds.forEach(companyId => {
          const companyMessage: CompanyMessage = {
            companyId,
            parentJob: { eventId, timestamp },
          }
          const dataBuffer = Buffer.from(JSON.stringify(companyMessage))
          // publish message for each company
          promises.push(publisher.publish(dataBuffer))
        })
        await Promise.all(promises)
        // all messages published
        console.log(`Company subjobs published for eventId=[${eventId}].`)
        // mark job complete
        return markJobComplete(monthlyJobRef)
      }
      return
    })
  })
