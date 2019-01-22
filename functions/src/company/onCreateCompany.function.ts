import { admin, functions } from '../globalDeps'

exports = module.exports = functions.firestore
  .document('companies/{companyId}')
  .onCreate(async (snap, context) => {
    const createdBy = snap.data()!.createdBy
    const companyId = context.params.companyId

    const userProfileRef = admin
      .firestore()
      .collection('userProfiles')
      .doc(createdBy)

    return admin
      .auth()
      .setCustomUserClaims(createdBy, { activeCompany: companyId })
      .then(() => {
        console.log(`company ${companyId} set for user ${createdBy}`)
        return admin.firestore().runTransaction(async txn => {
          const profileSnap = await txn.get(userProfileRef)

          const profileChange = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          } //{ activeCompany: snap.id }

          if (profileSnap.exists) {
            return txn.update(userProfileRef, profileChange)
          } else {
            return txn.create(userProfileRef, {
              ...profileChange,
              createdAt: profileChange.updatedAt,
            })
          }
        })
      })
  })
