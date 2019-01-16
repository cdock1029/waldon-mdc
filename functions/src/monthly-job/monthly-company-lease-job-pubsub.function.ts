import { admin, functions } from '../globalDeps'
import {
  initJob,
  markJobComplete,
  retryTimedOut,
  MONTHLY_JOB,
  MONTHLY_COMPANY_JOB,
  MONTHLY_COMPANY_LEASE_JOB,
} from './monthlyJobDeps'

exports = module.exports = functions.pubsub
  .topic(MONTHLY_COMPANY_LEASE_JOB)
  .onPublish((message: { json: LeaseMessage }, { eventId, timestamp }) => {
    if (retryTimedOut({ timestamp, maxRetryWindowMillis: 60000 })) {
      console.log(
        `Dropping event ${eventId} for job ${MONTHLY_COMPANY_LEASE_JOB}, timestamp=[${timestamp}].`
      )
      return
    }

    const leaseJobRef = admin
      .firestore()
      .collection(MONTHLY_JOB)
      .doc(message.json.parentJob!.parentJob!.eventId)
      .collection(MONTHLY_COMPANY_JOB)
      .doc(message.json.parentJob!.eventId)
      .collection(MONTHLY_COMPANY_LEASE_JOB)
      .doc(eventId)

    return initJob(leaseJobRef, 10000).then(async (shouldDoWork: boolean) => {
      if (shouldDoWork) {
        /* 1. apply rent for the month
           2. determine if late fee needs applied, calculate, add charge.
        */

        return admin
          .firestore()
          .runTransaction(async txn => {
            const leaseRef = admin
              .firestore()
              .collection('companies')
              .doc(message.json.companyId)
              .collection('leases')
              .doc(message.json.leaseId)

            const leaseSnap = await txn.get(leaseRef)
            const lease = leaseSnap.data() as { balance: number }

            // if balance <= 0, skip
            if (lease.balance > 0) {
              // check for existing LATE_FEE last month..
              const prevMonthLateFees = await leaseRef
                .collection('transactions')
                .where('date', '>=', 'prev month day 1')
                .where('date', '<=', 'prev month last day')
                .where('SUB_TYPE', '==', 'LATE_FEE')
                .get()

              if (prevMonthLateFees.empty) {
                // no existing late fee, lets apply if applicable..
              }
            }

            // positive bal, no charge yet. Amount??
            // if bal < PENALTY_FEE_THRESHOLD(100?), fee = STANDARD_LATE_FEE(30)
            // else fee = PENALTY_FEE_AMOUNT(100?)

            // rent = lease.rent

            // batch save: {rent, lateFee?} CHARGES

            // mark job complete
          })
          .then(() => {
            return markJobComplete(leaseJobRef)
          })
      }
      return
    })
  })
