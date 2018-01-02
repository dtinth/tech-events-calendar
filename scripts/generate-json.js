/** @flow */
const fs = require('fs')
const parseReadme = require('../lib/parseReadme')

function main () {
  const diagnostic = { errors: [ ] }
  try {
    const rawContent = fs.readFileSync('./README.md', { encoding: 'utf8' })
    const json = parseReadme(rawContent, 'README.md')
    const path = 'public/calendar.json'
    fs.writeFileSync(path, JSON.stringify(json, null, 2))
    console.log('* Written calendar to', path)
  } catch (e) {
    if (!e.location) {
      throw e
    }
    diagnostic.errors.push({
      message: e.message,
      location: e.location
    })
    throw e
  } finally {
    require('child_process').execSync('mkdir -p tmp')
    const path = 'tmp/readme-parse-diagnostic.json'
    fs.writeFileSync(path, JSON.stringify({ }, null, 2))
    console.log('* Diagnostic information written to', path)
  }
}

main()
