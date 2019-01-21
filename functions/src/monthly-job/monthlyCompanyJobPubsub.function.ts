import { admin, functions } from '../globalDeps'
import {
  pubsub,
  initJob,
  markJobComplete,
  retryTimedOut,
  MONTHLY_JOB,
  MONTHLY_COMPANY_JOB,
  MONTHLY_COMPANY_LEASE_JOB,
} from './monthlyJobDeps'

exports = module.exports = functions.pubsub
  .topic(MONTHLY_COMPANY_JOB)
  .onPublish((message: { json: CompanyMessage }, { eventId, timestamp }) => {
    if (retryTimedOut({ timestamp })) {
      console.log(
        `Dropping event ${eventId} for job ${MONTHLY_COMPANY_JOB}, timestamp=[${timestamp}].`
      )
      return
    }

    const companyJobRef = admin
      .firestore()
      .collection(MONTHLY_JOB)
      .doc(message.json.parentJob!.eventId)
      .collection(MONTHLY_COMPANY_JOB)
      .doc(eventId)

    return initJob(companyJobRef).then(async (shouldPublish: boolean) => {
      if (shouldPublish) {
        const publisher = pubsub.topic(MONTHLY_COMPANY_LEASE_JOB).publisher()
        const promises: Promise<any>[] = []

        const leaseIds: string[] = await admin
          .firestore()
          .collection('companies')
          .doc(message.json.companyId)
          .collection('leases')
          .where('status', '==', 'ACTIVE') //todo: consider COLLECTIONS when adding charges
          .get()
          .then(snap => snap.docs.map(doc => doc.id))

        leaseIds.forEach(async leaseId => {
          const leaseMessase: LeaseMessage = {
            parentJob: {
              eventId,
              timestamp,
              parentJob: message.json.parentJob,
            },
            companyId: message.json.companyId,
            leaseId,
          }
          const dataBuffer = Buffer.from(JSON.stringify(leaseMessase))
          promises.push(publisher.publish(dataBuffer))
        })
        await Promise.all(promises)
        // all messages published
        console.log(
          `Lease subjobs published for comapnyId=[${
            message.json.companyId
          }], eventId=[${eventId}].`
        )
        // mark job complete
        return markJobComplete(companyJobRef)
      }
      return
    })
  })
