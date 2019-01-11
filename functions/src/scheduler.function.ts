import { functions, admin, reportError } from './globalDeps'
// import { Request, Response } from 'express'

// exports = module.exports = functions.https.onRequest(
//   (req: Request, res: Response) => {
//     // already parsed as json
//     const body = req.body
//     admin
//       .firestore()
//       .collection('scheduler')
//       .doc()
//       .set({
//         date: admin.firestore.FieldValue.serverTimestamp(),
//         ...body,
//       })
//       .then(() => {
//         res.send('ok')
//       })
//       .catch(async (e: Error) => {
//         console.log('Error:', e.message)
//         await reportError(e)
//         res.status(500).send('internal error')
//       })
//   },
// )

exports = module.exports = functions.pubsub.topic('demo-topic').onPublish(
  (message, context): Promise<boolean> => {
    const attributes = message.attributes
    const data = message.json
    return admin
      .firestore()
      .collection('scheduler')
      .doc()
      .set({
        date: admin.firestore.FieldValue.serverTimestamp(),
        ...data,
        ...attributes,
      })
      .then(() => {
        return true
      })
      .catch(async (e: Error) => {
        console.log('Error:', e.message)
        await reportError(e)
        return false
      })
  },
)
