import { functions } from '../globalDeps'
import { getClient, cloudtasks, acknowledgeTask, parent } from './tasksDeps'
import { cloudtasks_v2beta2 } from 'googleapis'

exports = module.exports = functions.pubsub.topic('pull-task').onPublish(
  async (message, context): Promise<boolean> => {
    const authClient = await getClient()

    // params?: Params$Resource$Projects$Locations$Queues$Tasks$Lease, options?: MethodOptions
    /*const request = {
      parent,
      responseView: 'FULL',
      pageSize: 1,
      auth: authClient,
    }*/
    const request: cloudtasks_v2beta2.Params$Resource$Projects$Locations$Queues$Tasks$Lease = {
      parent,
      auth: authClient,
      requestBody: {
        leaseDuration: '10s',
        maxTasks: 1,
        responseView: 'FULL',
      },
    }

    try {
      // const {
      //   data: { tasks },
      // } = await cloudtasks.projects.locations.queues.tasks.list(request)

      const {
        data: { tasks },
      } = await cloudtasks.projects.locations.queues.tasks.lease(request)

      if (tasks) {
        const task = tasks[0]
        let payload = Buffer.from(
          task.pullMessage!.payload!,
          'base64',
        ).toString('utf8')
        payload = JSON.parse(payload)
        console.log('Pulled task %j', { ...task, pullMessage: payload })
        return acknowledgeTask(task)
      } else {
        console.log('tasks was undefined')
        return false
      }
    } catch (e) {
      console.error(e)
      return false
    }
  },
)
