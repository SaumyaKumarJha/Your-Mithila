const https = require('https')

const SITE = process.env.SITE_URL || 'https://yourmithila.in'
const PATHS = ['/', '/robots.txt', '/sitemap.xml', '/api/properties']

function check(path) {
  return new Promise((resolve) => {
    const url = new URL(path, SITE)
    const req = https.get(url, { timeout: 10000 }, (res) => {
      resolve({ path: url.href, status: res.statusCode })
    })
    req.on('error', (err) => resolve({ path: url.href, error: err.message }))
    req.on('timeout', () => { req.destroy(); resolve({ path: url.href, error: 'timeout' }) })
  })
}

;(async function main(){
  console.log('Smoke test target:', SITE)
  const results = []
  for (const p of PATHS) {
    const r = await check(p)
    results.push(r)
    console.log(r.path, r.status || r.error)
  }
  const failing = results.filter(r => r.status && r.status >= 400 || r.error)
  if (failing.length) {
    console.error('Smoke test failed for:', failing)
    process.exit(2)
  }
  console.log('Smoke tests passed')
  process.exit(0)
})()
