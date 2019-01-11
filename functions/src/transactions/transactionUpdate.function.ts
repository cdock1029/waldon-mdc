import { admin, functions } from '../globalDeps'
import { Dinero, addToBalance, subtractFromBalance } from './transactionDeps'

exports = module.exports = functions.firestore
  .document(
    'companies/{companyId}/leases/{leaseId}/transactions/{transactionId}',
  )
  .onUpdate(
    async (change, context): Promise<boolean> => {
      const { eventId } = context
      const eventDocRef = admin
        .firestore()
        .collection('changeEvents')
        .doc(eventId)
      console.log('transactionUpdate eventId:', eventId)

      const { before, after } = change
      const leaseRef = after.ref.parent.parent
      if (!leaseRef) {
        console.error(
          `Transaction update error: [${
            after.id
          }] does not have a parent Lease.`,
        )
        await admin
          .firestore()
          .doc(after.ref.path)
          .delete()
        return false
      }

      const { amount: amountAfter, type, id }: Transaction = {
        id: after.id,
        ...after.data(),
      } as Transaction

      const { amount: amountBefore }: Transaction = {
        id: before.id,
        ...before.data(),
      } as Transaction

      if (amountBefore === amountAfter) {
        console.log('Amounts equal, not updating..')
        return false
      }

      return admin
        .firestore()
        .runTransaction(async trans => {
          const eventSnap = await trans.get(eventDocRef)
          if (eventSnap.exists) {
            // already processed..
            throw new Error(
              `Transaction update already processed eventId=[${
                context.eventId
              }]`,
            )
          }

          const leaseSnap = await trans.get(leaseRef)
          const lease: Lease = {
            id: leaseSnap.id,
            ...leaseSnap.data(),
          } as Lease

          const { balance } = lease

          // positive value increases magnitude of transactionType...
          const changeAmount = Dinero({ amount: amountAfter })
            .subtract(Dinero({ amount: amountBefore }))
            .getAmount()

          let newBalance: number
          switch (type) {
            // add 'changeAmount' to balance
            case 'CHARGE':
              newBalance = addToBalance(balance, changeAmount)
              break
            // subtract 'changeAmount' from balance
            case 'PAYMENT':
              newBalance = subtractFromBalance(balance, changeAmount)
              break
            default:
              throw new Error(
                `unhandled Transaction update for type=[${type}] for id=${id}`,
              )
          }
          trans.update(leaseRef, { balance: newBalance })
          trans.create(eventDocRef, {
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          })
        })
        .then(() => {
          console.log('Transaction update committed.')
          return true
        })
        .catch(e => {
          console.log('Transaction update failed: ', e)
          return false
        })
    },
  )
