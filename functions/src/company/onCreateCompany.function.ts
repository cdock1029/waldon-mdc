import { functions, admin } from '../globalDeps'
import { stripe } from './stripeDeps'

exports = module.exports = functions.firestore
  .document('companies/{companyId}')
  .onCreate(async (snap, context) => {
    const createdBy = snap.data()!.createdBy
    const companyId = snap.id

    const [user] = await Promise.all([
      admin.auth().getUser(createdBy),
      admin.auth().setCustomUserClaims(createdBy, { activeCompany: companyId }),
    ])

    const customer = await stripe.customers.create(
      {
        email: user.email,
        metadata: { companyId },
      },
      { idempotency_key: companyId }
    )

    const batch = admin.firestore().batch()
    const userProfileRef = admin.firestore().doc(`userProfiles/${user.uid}`)

    // hack to refresh user token on client
    batch.update(userProfileRef, {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    batch.update(snap.ref, {
      stripeCustomerId: customer.id,
    })

    return batch.commit()
  })
