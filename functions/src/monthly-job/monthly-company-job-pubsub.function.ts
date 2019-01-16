import { admin, functions } from '../globalDeps'
import {
  pubsub,
  initJob,
  markJobComplete,
  MONTHLY_JOB,
  MONTHLY_COMPANY_JOB,
  MONTHLY_COMPANY_PROPERTY_JOB,
} from './monthlyJobDeps'

const fs = admin.firestore()
const eventMaxAge = 10000 // max age: 10 seconds

exports = module.exports = functions.pubsub
  .topic(MONTHLY_COMPANY_JOB)
  .onPublish((message: { json: CompanyMessage }, { eventId, timestamp }) => {
    const eventAge = Date.now() - Date.parse(timestamp)
    if (eventAge > eventMaxAge) {
      // skip retrying if too old
      console.log(
        `Dropping event ${eventId} for job ${MONTHLY_COMPANY_JOB} with age ${eventAge} ms.`
      )
      return
    }

    const companyJobRef = fs
      .collection(MONTHLY_JOB)
      .doc(message.json.parentEventId)
      .collection(MONTHLY_COMPANY_JOB)
      .doc(eventId)

    return initJob(companyJobRef)
      .then(async (shouldPublish: boolean) => {
        if (shouldPublish) {
          const publisher = pubsub
            .topic(MONTHLY_COMPANY_PROPERTY_JOB)
            .publisher()
          const promises: Promise<any>[] = []

          const propertyId: string[] = await admin
            .firestore()
            .collection('companies')
            .doc(message.json.companyId)
            .collection('properties')
            .get()
            .then(snap => snap.docs.map(doc => doc.id))

          companies.docs.forEach(async snap => {
            const dataBuffer = Buffer.from(
              JSON.stringify({
                ...companyJobMessageTemplate,
                companyId: snap.id,
              })
            )

            const messageId = await pubsub
              .topic(MONTHLY_COMPANY_PROPERTY_JOB)
              .publisher()
              .publish(dataBuffer)

            subJobMessageIds.push(messageId)
          })
          return txn.create(monthlyCompanyJobDocRef, {
            timestamp: Date.parse(timestamp),
            subJobMessageIds,
          })
        }
        return 'Job already exists!'
      })
      .then(result => {
        console.log('Transaction success:', result, `eventId=[${eventId}]`)
      })
      .catch(error => {
        console.log('Transaction failure:', error, `eventId=[${eventId}]`)
      })
  })
