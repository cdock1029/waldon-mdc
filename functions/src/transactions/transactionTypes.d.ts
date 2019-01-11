interface Transaction {
  id: string
  amount: number
  type: 'PAYMENT' | 'CHARGE'
  subType?: 'LATE_FEE' | 'RENT' | string
  date: FirebaseFirestore.Timestamp
  error?: {
    exists: boolean
    message: string
  }
}
interface Lease {
  id: string
  balance: number
}

interface ChangeEvent {
  dateCreate: FirebaseFirestore.Timestamp
}
