import { expect, test } from 'vitest'
import sdk, { JoblistSDK } from './sdk.js'

test('my test', () => {
	const mySdk = new JoblistSDK()
  expect(mySdk.config.config.url).toBe("https://joblist.gitlab.io/workers/joblist.db")
})
