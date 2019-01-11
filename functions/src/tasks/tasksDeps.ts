import { google, cloudtasks_v2beta2 } from 'googleapis'
const scopes = ['https//www.googleapis.com/auth/cloud-platform']

export const project = 'wpmfirebaseproject'
export const location = 'us-central1'
export const queue = 'wpm-companies-queue'
export const parent = `projects/${project}/locations/${location}/queues/${queue}`

export const cloudtasks = google.cloudtasks('v2beta2')
// export const fuck = google.cloudshell
export const getClient = () => google.auth.getClient({ scopes })

export const acknowledgeTask = async (task: cloudtasks_v2beta2.Schema$Task) => {
  const authClient = await getClient()

  const request = {
    name: task.name,
    scheduleTime: task.scheduleTime,
    auth: authClient,
  }

  return cloudtasks.projects.locations.queues.tasks
    .acknowledge(request)
    .then(() => {
      console.log(`Acknowledged task ${task.name}`)
      return true
    })
    .catch(e => {
      console.error(`Error aknowledging task: ${task.name}. `, e)
      return false
    })
}

export enum TOPICS {
  // cloud scheduler publishes trigger message 'Every 1 months' to this topic
  // subscriber cloud function begins job:
  // 1. creates firestore Document tracking job progress, keyed by month: '2018-08'
  // 2. create cloud-scheduled pubsub trigger for task-router ... 'Every 1 mins'
  // 3. creates 'START' task in queue ?
  MONTHLY_JOB_CRON = 'monthly-job-cron',

  // [cloud scheduler] then initiates an 'Every 1 mins' message to task-router topic
  // subscriber function repeatedly:
  // 1. pulls tasks from `monthly-job-queue`
  // 2. routes messages to appropriate pub-sub topic. (does not create tasks itself)
  // 3. e.g. task: 'COMPANY' => pubsub topic 'COMPANY' etc..
  MONTHLY_JOB_TASK_ROUTER = 'monthly-job-task-router',

  /* [start, company, lease] */
  /* subscribe to corresponding pubsub TOPIC, Do work, create next appropriate TASK */
  /* sub TOPIC => Cloud Function => add TASK to Queue */

  // ** what is the "Document" for?
  // when tasks aren't acknowledged, they're put back in queue.. good enough?
  // when would we need to reference a tracking document??
  // where aren't things idempotent??

  // *** IDEMPOTENT: no duplicate tasks.... or... duplicates don't matter, de-duped some other way?
  // really, we want *no extra writes to firestore. No non-idempotent writes..*
  // where are we ** really ** updating firestore: in Lease task

  // topic <-> function pair
  // params: {}
  // 1. reads list of companies from firestore
  // 2. creates COMPANY TASK for each company in `monthly-job-queue`
  // 3. updates firestore job Document.. somehow TODO
  MONTHLY_JOB_START = 'monthly-job-start',

  // topic <-> function pair
  // params: {companyId}
  // 1. reads list of leases for {companyId} from firestore  ** can do filtering here.. postive balance, active etc. **
  // 2. creates LEASE task for each lease in `monthly-job-queue`
  // 3. updates firestore job Document.. somehow TODO
  MONTHLY_JOB_COMPANY = 'monthly-job-company',

  // topic <-> function pair
  // params: {companyId, leaseId} ?
  /*
    Late fee:
    - depending on late-fee policy, check if a fee already applied "last month"
    - as per policy, apply late fee charge.. TODO
    - apply current months rent charge
    - notifications, recording etc.
  */
  // 1. in transaction: read transactions for {companyId / leaseId} from firestore
  // 2. calculate fee, apply charge, apply rent
  // 3. updates firestore job Document.. somehow TODO
  // 4. aknowledge task
  MONTHLY_JOB_LEASE = 'monthly-job-lease',
}
