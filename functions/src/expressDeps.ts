import express, { Request, Response, NextFunction } from 'express'
import cookieParser from 'cookie-parser'
import cookieSession from 'cookie-session'
import Cors from 'cors'
import { admin } from './globalDeps'

const cors = Cors({ origin: true, maxAge: 86400 })

export const getRouter = () => {
  const router = express.Router()
  router.use(cors)
  return router
}

let path: any
export const getApp = () => {
  require('ejs')
  if (!path) {
    path = require('path')
  }
  const app = express()
  app.use(cors)
  app.set('trust proxy', 1)
  app.set('views', path.join(__dirname, '../src/views'))
  app.set('view engine', 'ejs')
  return app
}

export const getCookieParser = () => cookieParser()
export const getCookieSession = () => {
  return cookieSession({
    name: 'session',
    keys: ['asdfaopawieoioe', 'qpowehophs', 'qphodoiseh'],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
}
// export const getCors = () => Cors({ origin: true, maxAge: 86400 })

let Tokens: any
let csrf: any
export async function generateAntiForgery(session: any) {
  if (!Tokens) {
    Tokens = require('csrf')
  }
  if (!csrf) {
    csrf = new Tokens()
  }
  const secret = await csrf.secret()
  const token = csrf.create(secret)
  session.secret = secret
  return token
}

export const validateFirebaseIdToken: (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction,
) => void = async (req, res, next) => {
  if (
    (!req.headers.authorization ||
      !req.headers.authorization.startsWith('Bearer ')) &&
    !(req.cookies && req.cookies.__session)
  ) {
    res.status(403).send('Unauthorized')
    return
  }

  let idToken
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    idToken = req.headers.authorization.split('Bearer ')[1]
  } else if (req.cookies) {
    idToken = req.cookies.__session
  } else {
    res.status(403).send('Unauthorized')
    return
  }
  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken)
    req.user = decodedIdToken
    next()
  } catch (error) {
    console.error('Error while verifying Firebase ID token:', error)
    res.status(403).send('Unauthorized')
  }
}
