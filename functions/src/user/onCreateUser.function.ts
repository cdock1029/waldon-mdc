import { admin, functions } from '../globalDeps'

exports = module.exports = functions.auth
  .user()
  .onCreate(async (user, context) => {
    return admin
      .firestore()
      .collection('userProfiles')
      .doc(user.uid)
      .create({ email: user.email, createdAt: new Date(context.timestamp) })
  })
