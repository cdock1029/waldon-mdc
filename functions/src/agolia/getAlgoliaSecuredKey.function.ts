import { functions, config, admin } from '../globalDeps'
import { client } from './algoliaDeps'

exports = module.exports = functions.https.onCall(
  async (data: any, context): Promise<{ key: string }> => {
    context.rawRequest.res!.setHeader('Access-Control-Max-Age', 86400)
    context.rawRequest.res!.setHeader('connection', 'keep-alive')

    if (data && data.apex && data.apex === config.apex.wpm.key) {
      return { key: 'ok' }
    }
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Function must be called while authenticated.',
      )
    }
    const activeCompany: string | undefined = context.auth.token.activeCompany
    if (!activeCompany) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Function must be called while authenticated.',
      )
    }
    const uid = context.auth.uid
    const params = {
      filters: `companyId:${activeCompany}`,
      userToken: uid,
    }
    const algoliaSecuredApiKey = client.generateSecuredApiKey(
      config.algolia.search_key,
      params,
    )
    // todo: can we check if this exists on the user (since tied to activeCompany, if not loade here.. then save.)
    await admin
      .auth()
      .setCustomUserClaims(uid, { activeCompany, algoliaSecuredApiKey })
    return { key: algoliaSecuredApiKey }
  },
)
