import * as firebaseFunctions from 'firebase-functions'
import * as firebaseAdmin from 'firebase-admin'
import Logging from '@google-cloud/logging'

firebaseAdmin.initializeApp()
firebaseAdmin.firestore().settings({ timestampsInSnapshots: true })

export const logging = new Logging()
export const admin = firebaseAdmin
export function wasCalled(functionName: string): boolean {
  return (
    !process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === functionName
  )
}

export const functions = firebaseFunctions
export const config = functions.config()

// To keep on top of errors, we should raise a verbose error report with Stackdriver rather
// than simply relying on console.error. This will calculate users affected + send you email
// alerts, if you've opted into receiving them.
// [START reporterror]
export async function reportError(err: Error, context = {}): Promise<boolean> {
  // This is the name of the StackDriver log stream that will receive the log
  // entry. This name can be any valid log stream name, but must contain "err"
  // in order for the error to be picked up by StackDriver Error Reporting.
  const logName = 'errors'
  const log = logging.log(logName)

  // https://cloud.google.com/logging/docs/api/ref_v2beta1/rest/v2beta1/MonitoredResource
  const metadata = {
    resource: {
      type: 'cloud_function',
      labels: { function_name: process.env.FUNCTION_NAME },
    },
  }

  // https://cloud.google.com/error-reporting/reference/rest/v1beta1/ErrorEvent
  const errorEvent = {
    message: err.stack,
    serviceContext: {
      service: process.env.FUNCTION_NAME,
      resourceType: 'cloud_function',
    },
    context: context,
  }

  try {
    await log.write(log.entry(metadata, errorEvent))
    return true
  } catch (e) {
    console.log('Writing error to log caused error: ', e.message)
    return false
  }
}
// [END reporterror]
