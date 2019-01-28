import { functions } from '../globalDeps'
import Stripe from 'stripe'

export const stripe = new Stripe(functions.config().stripe.secret)
