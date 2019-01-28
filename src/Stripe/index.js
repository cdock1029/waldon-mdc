import React from 'react'
import {
  Elements,
  StripeProvider,
  CardElement,
  injectStripe,
} from 'react-stripe-elements'

function Form() {
  function handleSubmit(e) {
    e.preventDefault()
    console.log('submitted.')
  }
  return (
    <form className="checkout" onSubmit={handleSubmit}>
      <p>Would you like to complete the purchase?</p>
      <br />
      <CardElement />
      <br />
      <button type="submit">Send</button>
    </form>
  )
}

const StripeForm = injectStripe(Form)

function Stripe() {
  return (
    <StripeProvider apiKey={process.env.REACT_APP_STRIPE_API_KEY}>
      <div className="example">
        <h1>React Stripe Elements Example</h1>
        <Elements>
          <StripeForm />
        </Elements>
      </div>
    </StripeProvider>
  )
}

export default Stripe
