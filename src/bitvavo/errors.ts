import { Schema } from 'effect'

export class BitvavoApiError extends Schema.TaggedError<BitvavoApiError>()(
  'BitvavoApiError',
  {
    method: Schema.String.pipe(
      Schema.annotations({
        description: 'HTTP method used for the request',
        example: 'GET',
      }),
    ),
    endpoint: Schema.String.pipe(
      Schema.annotations({
        description: 'API endpoint that was called',
        example: '/balance',
      }),
    ),
    message: Schema.String.pipe(
      Schema.annotations({
        description: 'Error message for get balance operation',
        example: 'Failed to fetch balances from Bitvavo',
      }),
    ),
  },
) {}
