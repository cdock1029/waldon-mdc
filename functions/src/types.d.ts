declare module 'node-quickbooks'
declare module 'doasync'

declare module 'dinero.js'

declare module '@google-cloud/pubsub'

type DocSnap = FirebaseFirestore.DocumentSnapshot
type FSTransaction = FirebaseFirestore.Transaction
type TransactionPromise = Promise<FSTransaction>

interface JobMessage {
  parentEventId: string
  parentEventTimestamp: string
}

interface CompanyMessage extends JobMessage {
  companyId: string
}

interface Job {
  taskComplete: boolean
  lease: FirebaseFirestore.Timestamp
}
