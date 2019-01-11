import { functions } from './globalDeps'
import {
  // getApp,
  getRouter,
  generateAntiForgery,
  getCookieParser,
  getCookieSession,
  validateFirebaseIdToken,
} from './expressDeps'
import QuickBooks from 'node-quickbooks'
import axios from 'axios'
import qs from 'query-string'
import doAsync from 'doasync'
import { auth } from 'firebase-admin'
// tslint:disable-next-line:no-duplicate-imports
import { Request, Response, Express } from 'express'
type AuthRequest = Request & { user?: auth.DecodedIdToken }

const app = getRouter()
const config = functions.config()

console.log({
  FIREBASE_CONFIG: process.env.FIREBASE_CONFIG,
  NODE_ENV: process.env.NODE_ENV,
  GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
})
const isDev = process.env.NODE_ENV === 'development'

const {
  consumer_key: consumerKey,
  consumer_secret: consumerSecret,
} = config.qbo
const appRoot = isDev ? 'wpmfirebaseproject/us-central1/qbo' : 'qbo'
const AUTHORIZATION_URL =
  config.qbo.authorization_url || 'https://appcenter.intuit.com/connect/oauth2'
// const TOKEN_URL = qbo.token_url || 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'
// QuickBooks.setOauthVersion('2.0')

app.use(getCookieParser())
app.use(getCookieSession())

app.get('/', (req, res) => {
  res.redirect('start')
})
app.post('/', (req, res) => {
  res.json({ postedBody: req.body })
})
// app.get('/start', function(req: Request, res: Response) {
//   res.render('intuit', {
//     protocol: req.protocol,
//     host: req.header('host'),
//     appRoot,
//     appCenter: QuickBooks.APP_CENTER_BASE,
//   })
// })
app.get('/apex', (req, res) => {
  res.json({ response: 'ok' })
})

app.get(
  '/requestToken',
  async (req: Request & { session: any }, res: Response) => {
    let redirectUri = `${AUTHORIZATION_URL}?client_id=${consumerKey}&redirect_uri=${encodeURIComponent(
      `${req.protocol}://${req.header('host')}/${appRoot}/callback/`,
    )}&scope=com.intuit.quickbooks.accounting&response_type=code`

    const state = await generateAntiForgery(req.session /*, csrf*/)
    redirectUri += `&state=${state}`

    console.log('redirectUri in /requestToken:', redirectUri)

    res.redirect(redirectUri)
  },
)

app.get('/callback', async (req: Request, res: Response) => {
  const authToken = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    'base64',
  )

  let data
  const redirectUri = `${req.protocol}://${req.header(
    'host',
  )}/${appRoot}/callback/`
  console.log('redirectUri in /callback:', redirectUri)
  try {
    const result = await axios({
      url: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authToken}`,
      },
      data: qs.stringify({
        grant_type: 'authorization_code',
        code: req.query.code,
        redirect_uri: redirectUri,
      }),
    })
    data = result.data
  } catch (e) {
    console.log(e)
    return res.send(`Error 1: ${e.message}`)
  }

  const Qbo = doAsync(
    new QuickBooks(
      consumerKey,
      consumerSecret,
      data.access_token,
      false, // tokenSecret
      req.query.realmId, // realmId
      true, // sandbox
      false, // debugging
      4, // minorVersion
      '2.0', // oauth version
      data.refresh_token, // refresh token
    ),
  )

  try {
    const accounts = await Qbo.findAccounts()
    return res.send(accounts)
  } catch (e) {
    console.log({ e })
    return res.send(`Error 2: ${e.message}`)
  }
})

app.get('/hello', validateFirebaseIdToken, (req: AuthRequest, res) => {
  res.send(`Hello ${req.user!.uid}`)
})

function handleRequest(req: Request, resp: Response): void {
  resp.setHeader('Access-Control-Max-Age', 86400)
  resp.setHeader('connection', 'Keep-Alive')
  // "Router" expects a NextFunction, cast as "Express" App instead
  return (app as Express)(req, resp)
}

exports = module.exports = functions.https.onRequest(handleRequest)
