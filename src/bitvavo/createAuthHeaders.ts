import crypto from 'crypto'
import { Config, Effect } from 'effect'

export default (method: string, endpoint: string, body: string = '') =>
  Effect.gen(function* () {
    const apiKey = yield* Config.string('BITVAVO_API_KEY')
    const apiSecret = yield* Config.string('BITVAVO_API_SECRET')

    const timestamp = Date.now()
    const url = `/v2${endpoint}`
    const signature = createSignature(timestamp, method, url, body, apiSecret)

    return {
      'Bitvavo-Access-Key': apiKey,
      'Bitvavo-Access-Signature': signature,
      'Bitvavo-Access-Timestamp': timestamp.toString(),
      'Content-Type': 'application/json',
    }
  })

function createSignature(
  timestamp: number,
  method: string,
  url: string,
  body: string,
  apiSecret: string,
): string {
  const message = timestamp + method + url + body
  return crypto.createHmac('sha256', apiSecret).update(message).digest('hex')
}
