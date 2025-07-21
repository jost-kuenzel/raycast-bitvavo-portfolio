const bitvavo = require('bitvavo')().options({
  APIKEY: process.env.BITVAVO_API_KEY,
  APISECRET: process.env.BITVAVO_API_SECRET,
  ACCESSWINDOW: 10000,
  RESTURL: 'https://api.bitvavo.com/v2',
  WSURL: 'wss://ws.bitvavo.com/v2/',
  DEBUGGING: false,
})

try {
  let response = await bitvavo.trades('BTC-EUR', {})
  for (let entry of response) {
    console.log(entry)
  }
} catch (error) {
  console.log(error)
}
