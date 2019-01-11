import { functions } from '../globalDeps'
import { cloudtasks, getClient, project, location, queue } from './tasksDeps'

exports = module.exports = functions.pubsub
  .topic('schedule-task')
  .onPublish(async (message, context) => {
    const authClient = await getClient()

    const attributes = message.attributes
    const data = message.json

    const scheduleTime = new Date()
    scheduleTime.setUTCMinutes(scheduleTime.getUTCMinutes() + 2)

    const task = {
      scheduleTime: scheduleTime,
      pull_message: {
        payload: Buffer.from(JSON.stringify({ data, attributes })).toString(
          'base64',
        ),
      },
    }

    const request = {
      parent: `projects/${project}/locations/${location}/queues/${queue}`,
      resource: { task },
      auth: authClient,
    }

    return cloudtasks.projects.locations.queues.tasks
      .create(request)
      .then(response => {
        console.log(`Created task ${response.data.name}.`)
        console.log(JSON.stringify(response.data, null, 2))
        return true
      })
      .catch(e => {
        console.error(e)
        return false
      })
  })
