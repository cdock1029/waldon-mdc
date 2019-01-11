import { admin, functions } from '../globalDeps'
import { addToBalance, subtractFromBalance } from './transactionDeps'

exports = module.exports = functions.firestore
  .document(
    'companies/{companyId}/leases/{leaseId}/transactions/{transactionId}',
  )
  .onCreate(
    async (snap, context): Promise<boolean> => {
      const { eventId } = context
      const eventDocRef = admin
        .firestore()
        .collection('changeEvents')
        .doc(eventId)
      console.log('transactionCreate eventId:', eventId)

      const transaction: Transaction = {
        id: snap.id,
        ...snap.data(),
      } as Transaction

      if (transaction.amount <= 0) {
        console.log(
          `Invalid transaction=[${transaction.id}] amount=[${
            transaction.amount
          }] (<= 0) Deleting..`,
        )
        await admin
          .firestore()
          .doc(snap.ref.path)
          .delete()
        return false
      }

      const leaseRef = snap.ref.parent.parent
      if (!leaseRef) {
        console.error(
          `Transaction error: [${snap.id}] does not have a parent Lease.`,
        )
        return false
      }

      return admin
        .firestore()
        .runTransaction(async trans => {
          const eventSnap = await trans.get(eventDocRef)
          if (eventSnap.exists) {
            // already processed..
            throw new Error(
              `Transaction create already processed eventId=[${
                context.eventId
              }]`,
            )
          }
          const { amount } = transaction
          const { balance } = await trans
            .get(leaseRef)
            .then(l => ({ ...l.data() } as Lease))

          let newBalance: number
          switch (transaction.type) {
            // increase balance
            case 'CHARGE':
              newBalance = addToBalance(balance, amount)
              break
            // decrease balance
            case 'PAYMENT':
              newBalance = subtractFromBalance(balance, amount)
              break
            default:
              throw new Error(
                `Unhandled Transaction type=[${transaction.type}] for id=${
                  transaction.id
                }`,
              )
          }
          trans.update(leaseRef, { balance: newBalance })
          trans.create(eventDocRef, {
            dateCreated: admin.firestore.FieldValue.serverTimestamp(),
          })
        })
        .then(() => {
          console.log('Transaction committed.')
          return true
        })
        .catch(e => {
          console.log('Transaction failed: ', e)
          return false
        })
    },
  )
