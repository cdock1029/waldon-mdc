import { admin, functions } from '../globalDeps'
import { addToBalance, subtractFromBalance } from './transactionDeps'

exports = module.exports = functions.firestore
  .document(
    'companies/{companyId}/leases/{leaseId}/transactions/{transactionId}',
  )
  .onDelete(
    async (snap, context): Promise<boolean> => {
      const { eventId } = context
      const eventDocRef = admin
        .firestore()
        .collection('changeEvents')
        .doc(eventId)
      console.log('transactionDelete eventId:', eventId)

      const leaseRef = snap.ref.parent.parent
      if (!leaseRef) {
        console.log(
          `Transaction error: [${snap.id}] does not have a parent Lease.`,
        )
        return false
      }
      const deletedTransaction = { id: snap.id, ...snap.data() } as Transaction

      return admin
        .firestore()
        .runTransaction(async trans => {
          const eventSnap = await trans.get(eventDocRef)
          if (eventSnap.exists) {
            // already processed..
            throw new Error(
              `Transaction delete already processed eventId=[${
                context.eventId
              }]`,
            )
          }

          const lease = await trans
            .get(leaseRef)
            .then(sn => ({ id: sn.id, ...sn.data() }))

          const { balance } = lease as Lease
          const { amount } = deletedTransaction

          let newBalance: number
          switch (deletedTransaction.type) {
            // reversing charge -> decrease balance
            case 'CHARGE':
              newBalance = subtractFromBalance(balance, amount)
              break
            // reversing payment -> increase balance
            case 'PAYMENT':
              newBalance = addToBalance(balance, amount)
              break
            default:
              throw new Error(
                `Unhandled Transaction type=[${
                  deletedTransaction.type
                }] for id=${deletedTransaction.id}`,
              )
          }
          trans.update(leaseRef, { balance: newBalance })
          trans.create(eventDocRef, {
            dateCreated: admin.firestore.FieldValue.serverTimestamp(),
          })
        })
        .then(() => {
          console.log('Transaction delete committed.')
          return true
        })
        .catch(e => {
          console.log('Transaction delete failed: ', e)
          return false
        })
    },
  )
