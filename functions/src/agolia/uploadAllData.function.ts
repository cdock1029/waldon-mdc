import { functions, admin, reportError } from '../globalDeps'
import { index } from './algoliaDeps'

function serialize(obj: object): object {
  return JSON.parse(JSON.stringify(obj))
}

exports = module.exports = functions.https.onCall(
  async (data: any, context): Promise<object> => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Function must be called while authenticated.'
      )
    }
    const activeCompany: string | undefined = context.auth.token.activeCompany
    if (!activeCompany) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Function must be called while authenticated.'
      )
    }

    const companies = await admin
      .firestore()
      .collection('companies')
      .get()

    const pending: any[] = companies.docs.map(compDoc => {
      const companyId = compDoc.id
      const compRef = compDoc.ref
      const result: any = [
        serialize({
          ...compDoc.data(),
          entity: 'company',
          objectID: companyId,
          companyId /*for use with securedKey*/,
        }),
      ]

      // [company, ...proprties: [property, ...units: [unit] ] ]
      result.push(
        compRef
          .collection('properties')
          .get()
          .then(props =>
            Promise.all(
              props.docs.map(async propDoc => {
                /* the Property Document */
                const propResult: any = [
                  serialize({
                    ...propDoc.data(),
                    entity: 'property',
                    objectID: propDoc.id,
                    companyId,
                  }),
                ]
                // level 2 !
                const units = await propDoc.ref
                  .collection('units')
                  .get()
                  .then(propSnap =>
                    propSnap.docs.map(unitDoc =>
                      serialize({
                        ...unitDoc.data(),
                        name: unitDoc.data().name,
                        entity: 'unit',
                        objectID: unitDoc.id,
                        companyId,
                      })
                    )
                  )
                return propResult.concat(units)
              })
            )
          )
      )
      result.push(
        // level 1
        compRef
          .collection('tenants')
          .get()
          .then(tens =>
            tens.docs.map(tenDoc =>
              serialize({
                ...tenDoc.data(),
                name: `${tenDoc.data()['lastName']}, ${
                  tenDoc.data()['firstName']
                }`,
                entity: 'tenant',
                objectID: tenDoc.id,
                companyId,
              })
            )
          )
      )
      result.push(
        // level 1
        compRef
          .collection('leases')
          .get()
          .then(leases =>
            leases.docs.map(leaseDoc =>
              serialize({
                ...leaseDoc.data(),
                entity: 'lease',
                objectID: leaseDoc.id,
                companyId,
              })
            )
          )
      )

      // const companyResult = await Promise.all(result)
      // console.log('companyResult', companyResult)
      // return companyResult
      return result
    })

    try {
      // await the 2nd level nested Promises
      console.log('pending array:', pending)
      const flattendPending = pending.flat(4)
      console.log('flattened pending', flattendPending)
      const loadedData = await Promise.all(flattendPending)
      console.log('loaded array:', loadedData)
      const flattenedLoaded = loadedData.flat(4)
      console.log('flattenedLoaded', flattenedLoaded)
      const content = await index().addObjects(flattenedLoaded)
      console.log('upload success: ', content)
      return { success: true, content }
    } catch (e) {
      console.log('Algolia addObjects error: ', e)
      await reportError(e, { user: context.auth.uid })
      return { success: false, error: e.mssage }
    }
  }
)
