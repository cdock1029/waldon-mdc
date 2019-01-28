import { admin, functions } from '../globalDeps'
import { stripe } from './stripeDeps'

const config = functions.config()
const planBase = config.stripe.plan_base
// const planPerProperty = config.stripe.plan_per_property

interface SubscriptionParams {
  companyId: string
  source: any
}
exports = module.exports = functions.https.onCall(
  async (data: SubscriptionParams, context) => {
    console.log('attempting to start sub for data:', data)
    const companyRef = admin.firestore().doc(`companies/${data.companyId}`)

    const companySnap = await companyRef.get()
    const company = companySnap.data()!

    try {
      const source = await stripe.customers.createSource(
        company.stripeCustomerId,
        { source: data.source }
      )
      if (!source) {
        throw new functions.https.HttpsError(
          'internal',
          'Stripe failed to attach payment card to customer account.'
        )
      }
    } catch (e) {
      console.log('stripe source creation error:', e)
      throw new functions.https.HttpsError('invalid-argument', e.message)
    }

    let sub
    try {
      sub = await stripe.subscriptions.create(
        {
          customer: company.stripeCustomerId,
          items: [{ plan: planBase } /*{ plan: planPerProperty }*/],
        },
        {
          idempotency_key: `create_subscription_${data.companyId}_${planBase}`,
        }
      )
    } catch (e) {
      console.log('stripe subscription creation error:', e)
      throw new functions.https.HttpsError('invalid-argument', e.message)
    }
    return companyRef.update({
      status: sub.status,
      propertyCount: 0,
      subscriptionId: sub.id,
      itemIds: sub.items.data.map(d => d.id),
    })
  }
)
