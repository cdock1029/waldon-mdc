declare module 'node-quickbooks'
declare module 'doasync'

declare module 'dinero.js'

declare module '@google-cloud/pubsub'

type DocSnap = FirebaseFirestore.DocumentSnapshot
type FSTransaction = FirebaseFirestore.Transaction
type TransactionPromise = Promise<FSTransaction>

interface JobMessage {
  parentJob?: JobMessage
  eventId?: string
  timestamp?: string
}

interface CompanyMessage extends JobMessage {
  companyId: string
}

interface LeaseMessage extends JobMessage {
  companyId: string
  leaseId: string
}

interface Job {
  taskComplete: boolean
  lease: FirebaseFirestore.Timestamp
}
