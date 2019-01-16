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
export const MONTHLY_COMPANY_LEASE_JOB = 'monthly-company-lease-job'

export const pubsub = new PubSub()

export function initJob(
  jobRef: FirebaseFirestore.DocumentReference,
  leaseTimeMillis = 5000 // default 5 second lease
): Promise<boolean> {
  return admin.firestore().runTransaction<boolean>(async txn => {
    const job = await txn.get(jobRef)
    // another function already completed this task
    if (job.exists && (job.data() as Job).taskComplete) {
      return false
    }
    // job not complete, but another function working on it currently...
    if (job.exists && new Date() < (job.data() as Job).lease.toDate()) {
      return Promise.reject('Lease already taken. Try later..')
    }

    // reserve lease to work on this task...
    txn.set(jobRef, {
      lease: new Date(new Date().getTime() + leaseTimeMillis),
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

export function retryTimedOut({
  timestamp,
  maxRetryWindowMillis = 30000, // default 30 second window for retries
}: {
  timestamp: string
  maxRetryWindowMillis?: number
}): boolean {
  const eventTimestamp = Date.parse(timestamp)
  const eventAge = Date.now() - eventTimestamp
  return eventAge > maxRetryWindowMillis
}
