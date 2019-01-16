import { admin } from '../globalDeps'
import { PubSub } from '@google-cloud/pubsub'

export enum JobStatus {
  CREATED = 'CREATED',
  STARTED = 'STARTED',
  ERROR = 'ERROR', // ?
  FINISHED = 'FINISHED',
}

export const MONTHLY_JOB = 'monthly-job'
export const MONTHLY_COMPANY_JOB = 'monthly-company-job'
export const MONTHLY_COMPANY_PROPERTY_JOB = 'monthly-company-property-job'
export const MONTHLY_COMPANY_PROPERTY_LEASE_JOB =
  'monthly-company-property-lease-job'

export const pubsub = new PubSub()

const leaseTime = 5 * 1000 // 5 seconds
export function initJob(
  monthlyRef: FirebaseFirestore.DocumentReference
): Promise<boolean> {
  return admin.firestore().runTransaction<boolean>(async txn => {
    const job = await txn.get(monthlyRef)
    if (job.exists && (job.data() as Job).taskComplete) {
      return false
    }
    if (job.exists && new Date() < (job.data() as Job).lease.toDate()) {
      return Promise.reject('Lease already taken. Try later..')
    }

    txn.set(monthlyRef, {
      lease: new Date(new Date().getTime() + leaseTime),
      taskComplete: false,
    })
    return true
  })
}
export function markJobComplete(
  monthlyRef: FirebaseFirestore.DocumentReference
) {
  const completedJob: Pick<Job, 'taskComplete'> = { taskComplete: true }
  return monthlyRef.set(completedJob)
}
