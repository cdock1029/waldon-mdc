import functions, { EventContext } from 'firebase-functions'
import admin from 'firebase-admin'
import {
  format,
  // getMonth,
  // subMonths
} from 'date-fns'

const serverTimeStamp = () => admin.firestore.FieldValue.serverTimestamp()
type Message = functions.pubsub.Message

const PUB_SUB_TOPIC_MLFRJ = 'monthly-late-fee-rent-job'
const MONTHLY_LATE_FEE_RENT_JOBS = 'monthly-late-fee-rent-jobs'
const COMPANY_JOBS_SUBCOLLECTION = 'company-job'
const LEASE_JOB_SUBCOLLECTION = 'lease-jobs'

interface JobDocument {
  createdAt: FirebaseFirestore.FieldValue
  startedAt?: FirebaseFirestore.FieldValue
  endedAt?: FirebaseFirestore.FieldValue
  subJobs?: SubJobs
}
interface SubJobs {
  [subJobKey: string]: JobDocument | undefined
}

//            C                  D             C            D          C          D
// monthly-late-fee-rent-jobs/{2018-08-03}/company-jobs/{companyId}/lease-jobs/{leaseId}
export const pubSubMonthlyLateFeesRent = functions.pubsub
  .topic(PUB_SUB_TOPIC_MLFRJ)
  .onPublish(
    async (message: Message): Promise<boolean> => {
      // global job ref
      const jobRef = admin
        .firestore()
        .collection(MONTHLY_LATE_FEE_RENT_JOBS)
        .doc(/* today */ format(new Date(), 'YYYY-MM-dd'))

      const companiesRef = admin.firestore().collection('companies')

      // get all companies
      const transactionPromise = admin
        .firestore()
        .runTransaction(async trans => {
          const companies = await trans.get(companiesRef)
          // initialize new Global Job Document
          const jobDocument: JobDocument = {
            createdAt: serverTimeStamp(),
            startedAt: serverTimeStamp(),
            // subJobs: {},
          }
          trans.set(jobRef, jobDocument)

          // for each Company, create Company job in sub-collection..
          // and add details to sub-jobs field
          companies.docs.forEach(({ id: companyId }) => {
            const companySubJobRef = jobRef
              .collection(COMPANY_JOBS_SUBCOLLECTION)
              .doc(companyId)

            const companySubJobDoc: JobDocument = {
              createdAt: serverTimeStamp(),
            }
            trans.set(companySubJobRef, companySubJobDoc)
            // add company sub-job to global job ref
            trans.update(jobRef, { [`subJobs.${companyId}`]: companySubJobDoc })
          })
        })

      // TODO: to "finish", this job, create a trigger for "update", on *this* global
      // job document, which will be modified by each sub-task..
      try {
        await transactionPromise
        console.log(
          'pubsub monthly lf/rent transaction (create company jobs) success',
        )
        return true
      } catch (e) {
        console.log('Transaction error:', e)
        return false
      }
    },
  )

// jobs/monthly-late-fee-rent-jobs/iterations/{day}/company-jobs/{companyId}
export const jobMonthlyLateFeesCompany = functions.firestore
  .document(
    `${MONTHLY_LATE_FEE_RENT_JOBS}/{jobDayId}/${COMPANY_JOBS_SUBCOLLECTION}/{companyId}`,
  )
  .onCreate(
    async (
      companyJobSnap: DocSnap,
      context: EventContext,
    ): Promise<boolean> => {
      const { companyId } = context.params
      const globalJobDocRef = companyJobSnap.ref.parent.parent
      // all active leases..
      // TODO: handle many many leases?
      const companyLeasesRef = admin
        .firestore()
        .collection('companies')
        .doc(companyId)
        .collection('leases')
        // status: ACTIVE | COLLECTIONS | INACTIVE
        // we want !== INACTIVE (collections & active will get charged)
        // so.. status < INACTIVE :D :) :S
        // !!!! TODO: think about logic.
        .where('status', '<', 'INACTIVE')

      if (!globalJobDocRef) {
        throw new Error(
          `Company job doc [${
            companyJobSnap.id
          }] has no Global Job ancestor. eventId:[${context.eventId}]`,
        )
      }

      // in a transaction, mark this companyJob as "started..."
      try {
        const result = await admin
          .firestore()
          .runTransaction<{ alreadyStarted: boolean }>(async trans => {
            const globalJobSnap = await trans.get(globalJobDocRef)
            const startedAtField = `subJobs.${companyId}.startedAt`

            if (globalJobSnap.get(startedAtField)) {
              // job already started.
              return Promise.resolve({ alreadyStarted: true })
            }

            const companyLeases = await trans.get(companyLeasesRef)

            trans.update(globalJobDocRef, {
              [startedAtField]: serverTimeStamp(),
            })

            companyLeases.docs.forEach(({ id: leaseId }) => {
              // creating lease-sub job
              const leaseSubJobRef = companyJobSnap.ref
                .collection(LEASE_JOB_SUBCOLLECTION)
                .doc(leaseId)

              const leaseSubJobDoc: JobDocument = {
                createdAt: serverTimeStamp(),
              }
              trans.set(leaseSubJobRef, leaseSubJobDoc)
              trans.update(companyJobSnap.ref, {
                [`subJobs.${leaseId}`]: leaseSubJobDoc,
              })
            })

            return Promise.resolve({ alreadyStarted: false })
          })
        if (result.alreadyStarted) {
          console.log('already started')
          return false
        }
        console.log('monthly lf/rent company batch (create lease jobs) success')
        return true
      } catch (e) {
        console.error(
          `Error marking global MLFRJ > subjob started for company[${companyId}].`,
          e,
        )
        return false
      }
    },
  )

export const jobMonthlyLateFeesRentLease = functions.firestore
  .document(
    `${MONTHLY_LATE_FEE_RENT_JOBS}/{day}/${COMPANY_JOBS_SUBCOLLECTION}/{companyId}/${LEASE_JOB_SUBCOLLECTION}/{leaseId}`,
  )
  .onCreate(
    async (snap: DocSnap, context: EventContext): Promise<boolean> => {
      // individual lease calulation... look at balance, rent, late fee policy etc.
      const { /*day,*/ companyId, leaseId } = context.params

      const leaseRef = admin
        .firestore()
        .collection(`companies/${companyId}/leases`)
        .doc(leaseId)

      console.log('TODO: ', leaseRef)

      /* const lease = await leaseRef.get() */
      // if balance <= 0... i think we'er done...

      // else ... need to see if applied a late fee past month already.
      // get month of today .get last month. today's Month - 1.
      // const lastMonth = subMonths(day, 1)
      // const startLastMonth = new Date(
      //   lastMonth.getFullYear(),
      //   lastMonth.getMonth(),
      //   1,
      // )

      /* const leaseTransactionsRef = leaseRef
    .collection('transactions')
    .where('date', '>=', startLastMonth)
    .where('date', '<', new Date(day))
    .where('TYPE', '==', 'LATE_FEE')
    */

      /* const prevLateFees = await leaseTransactionsRef.get() */

      const batch = admin.firestore().batch()

      try {
        await batch.commit()
        console.log('monthly lf/rent company batch (create lease jobs) success')
        return true
      } catch (e) {
        console.log('Batch error:', e)
        return false
      }
    },
  )
