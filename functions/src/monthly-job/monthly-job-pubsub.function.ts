import { admin, functions } from '../globalDeps'
import {
  pubsub,
  initJob,
  markJobComplete,
  MONTHLY_JOB,
  MONTHLY_COMPANY_JOB,
} from './monthlyJobDeps'

const eventMaxAge = 60000 // max age: 60 seconds

exports = module.exports = functions.pubsub
  .topic(MONTHLY_JOB)
  .onPublish((message, { eventId, timestamp }) => {
    const eventTimestamp = Date.parse(timestamp)
    const eventAge = Date.now() - eventTimestamp
    if (eventAge > eventMaxAge) {
      console.log(
        `Dropping event ${eventId} for job ${MONTHLY_JOB} with age ${eventAge} ms.`
      )
      return
    }

    const monthlyJobRef = admin
      .firestore()
      .collection(MONTHLY_JOB)
      .doc(eventId)

    return initJob(monthlyJobRef).then(async (shouldPublish: boolean) => {
      if (shouldPublish) {
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
            parentEventId: eventId,
            parentEventTimestamp: timestamp,
          }
          const dataBuffer = Buffer.from(JSON.stringify(companyMessage))
          promises.push(publisher.publish(dataBuffer))
        })
        await Promise.all(promises)
        console.log(`Company subjobs published for eventId=[${eventId}].`)
        return markJobComplete(monthlyJobRef)
      }
      return
    })
  })
