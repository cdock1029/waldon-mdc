import { admin, functions } from '../globalDeps'
import { JobStatus } from './monthlyJobDeps'
import { firestore } from 'firebase-admin'

const fs = admin.firestore()

interface CompanySubJob {
  id: string
  createdAt: firestore.FieldValue
  status: JobStatus
}

/*
  1) create: company sub collection jobs
  2) update: add sub jobs object to monthly-job 
  3) update: set monthly-job status to STARTED
*/
exports = module.exports = functions.firestore
  .document('monthly-job/{jobId}')
  .onCreate((snap, context) => {
    const monthlyJobRef = snap.ref
    const companiesRef = fs.collection('companies')

    return fs.runTransaction(async txn => {
      const monthlyJobSnap = await txn.get(monthlyJobRef)
      const monthlyJobStatus = monthlyJobSnap.get('status') as JobStatus

      if (monthlyJobStatus === JobStatus.CREATED) {
        const companiesSnap = await txn.get(companiesRef)

        const companies = companiesSnap.docs

        const doc = {
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          status: JobStatus.CREATED,
        }
        const companySubJobs: { [key: string]: CompanySubJob } = {}

        companies.forEach(company => {
          const jobDoc: CompanySubJob = { ...doc, id: company.id }
          companySubJobs[company.id] = jobDoc

          const companyJobRef = monthlyJobRef
            .collection('company-job')
            .doc(company.id)

          // create company sub job
          txn.create(companyJobRef, jobDoc)
        })

        // update monthly job: status & nested jobs object
        return txn.update(monthlyJobRef, {
          status: JobStatus.STARTED,
          companySubJobs,
        })
      }
      return
    })
  })
