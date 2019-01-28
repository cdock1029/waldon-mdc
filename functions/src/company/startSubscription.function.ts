import { admin, functions } from '../globalDeps'
import { stripe } from './stripeDeps'

const config = functions.config()
const planBase = config.stripe.plan_base
const planPerProperty = config.stripe.plan_per_property

interface SubscriptionParams {
  companyId: string
  source: any
}
exports = module.exports = functions.https.onCall(
  async (data: SubscriptionParams, context) => {
    const companyRef = admin.firestore().doc(`companies/${data.companyId}`)

    const companySnap = await companyRef.get()
    const company = companySnap.data()!

    const source = await stripe.customers.createSource(
      company.stripeCustomerId,
      { source: data.source }
    )
    if (!source) {
      throw new Error(
        'Stripe failed to attach payment card to customer account.'
      )
    }

    const sub = await stripe.subscriptions.create(
      {
        customer: company.stripeCustomerId,
        items: [{ plan: planBase }, { plan: planPerProperty }],
      },
      { idempotency_key: data.companyId }
    )
    return companyRef.update({
      status: sub.status,
      propertyCount: 0,
      subscriptionId: sub.id,
      itemIds: sub.items.data.map(d => d.id),
    })
  }
)
