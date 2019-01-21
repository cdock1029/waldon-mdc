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
        const leaseRef = admin
          .firestore()
          .collection('companies')
          .doc(message.json.companyId)
          .collection('leases')
          .doc(message.json.leaseId)
        const txnsRef = leaseRef.collection('transactions')

        return admin
          .firestore()
          .runTransaction(async txn => {
            const leaseSnap = await txn.get(leaseRef)
            const lease = leaseSnap.data() as { balance: number; rent: number }

            // if balance <= 0, skip
            if (lease.balance > 0) {
              // check for existing LATE_FEE last month..
              const prevMonthLateFeesQuery = leaseRef
                .collection('transactions')
                .where('date', '>=', 'prev month day 1')
                .where('date', '<=', 'prev month last day')
                .where('SUB_TYPE', '==', 'LATE_FEE')

              const prevMonthLateFees = await txn.get(prevMonthLateFeesQuery)

              if (prevMonthLateFees.empty) {
                // no existing late fee, lets apply if applicable..

                // if bal < PENALTY_FEE_THRESHOLD(100?), fee = STANDARD_LATE_FEE(30)
                // else fee = PENALTY_FEE_AMOUNT(100?)
                const lateFeeTxn: Txn = {
                  amount: 0,
                  date: new Date(),
                  type: 'CHARGE',
                  subType: 'LATE_FEE',
                }
                txn.create(txnsRef.doc(), lateFeeTxn)
              }
            }

            // rent = lease.rent
            const rentTxn: Txn = {
              amount: lease.rent,
              date: new Date(),
              type: 'CHARGE',
              subType: 'RENT',
            }
            txn.create(txnsRef.doc(), rentTxn)
          })
          .then(() => {
            // mark job complete
            return markJobComplete(leaseJobRef)
          })
      }
      return
    })
  })
