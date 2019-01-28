import React, { useEffect, useRef } from 'react'
import firebase from '../firebase'
import { useActiveCompany } from '../firebase/Auth'
import 'firebase/functions'

function Form() {
  const formRef = useRef(null)
  const activeCompany = useActiveCompany()

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.stripe.com/checkout.js'
    script.classList.add('stripe-button')
    script.setAttribute('data-key', process.env.REACT_APP_STRIPE_API_KEY)
    script.setAttribute('data-name', 'Idaeo Property Saas')
    script.setAttribute('data-panel-label', 'Subscribe')
    script.setAttribute(
      'data-description',
      'Click to subscribe to monthly service'
    )
    script.setAttribute(
      'data-image',
      'https://stripe.com/img/documentation/checkout/marketplace.png'
    )
    script.setAttribute('data-locale', 'auto')
    formRef.current.submit = () => {
      const token = formRef.current.stripeToken.value
      const startSubscription = firebase
        .functions()
        .httpsCallable('startSubscription')
      startSubscription({ companyId: activeCompany, source: token })
        .then(result => {
          console.log('success:', result)
        })
        .catch(err => {
          console.error('some error:', err)
        })
    }
    formRef.current.appendChild(script)
  }, [])

  return <form ref={formRef} className="checkout" />
}

// const StripeForm = injectStripe(Form)

function Stripe() {
  return (
    <div className="example">
      <h1>React Stripe Elements Example</h1>
      {/* <Elements>
          <StripeForm />
        </Elements> */}
      <Form />
    </div>
  )
}

export default Stripe
