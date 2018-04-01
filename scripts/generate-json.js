/** @flow */
const fs = require('fs')
const path = require('path')
const parseMarkdown = require('../lib/parseMarkdown')
const glob = require('glob')
const mkdirp = require('mkdirp')
const eventImageGenerator = require('../lib/eventImageGenerator')

process.on('unhandledRejection', (e) => {
  throw e
})

function hasError (checks) {
  return checks.some(isError)
  function isError (node) {
    if (node.type === 'item') {
      return (node.children || [ ]).some(isError)
    }
    if (node.type === 'check') {
      return node.result.status === false
    }
    throw new Error('Invalid node type: ' + node.type)
  }
}

function formatError (checks) {
  const out = [ ]
  const traverse = (node, prefix) => {
    if (node.type === 'item') {
      out.push(prefix + '  - ✴️ ' + node.title)
      return (node.children || [ ]).forEach(child => traverse(child, prefix + '    '))
    }
    if (node.type === 'check') {
      if (node.result.status === true) {
        out.push(prefix + '  - ✅ ' + node.title)
      } else if (node.result.status === false) {
        const message = node.result.message
          ? `: ${node.result.message}`
          : ''
        out.push(prefix + '  - ❌ ' + node.title + message)
      } else {
        out.push(prefix + '  - *️⃣ ' + node.title)
      }
      return
    }
    throw new Error('Invalid node type: ' + node.type)
  }
  for (const node of checks) {
    traverse(node, '')
  }
  return out.join('\n')
}

async function main () {
  const diagnostic = { errors: [ ] }
  const files = glob.sync('data/*/*.md')
  await eventImageGenerator.initialize()
  try {
    const events = [ ]
    for (const file of files) {
      try {
        const md = fs.readFileSync(file, 'utf8')
        const { checks, event } = parseMarkdown(md)
        event.declared = {
          filename: file,
          line: 1,
          column: 1
        }
        const imageFilepath = findImage(file)
        if (imageFilepath) {
          event.image = copyEventImage(imageFilepath, event.id)
        } else {
          event.image = await generateEventImage(event)
        }
        if (hasError(checks)) {
          diagnostic.errors.push({
            location: event.declared,
            message: formatError(checks)
          })
          continue
        }
        events.push(event)
      } catch (e) {
        console.error('Caught error while parsing markdown:', e.stack)
        diagnostic.errors.push({
          location: {
            filename: file,
            line: 1,
            column: 1
          },
          message: e.message
        })
      }
    }
    validateJson(events)
    const path = 'public/calendar.json'
    if (!diagnostic.errors.length) {
      events.sort(compareEvents)
      fs.writeFileSync(path, require('format-json').diffy(events))
      console.log('* Written calendar to', path)
    } else {
      console.log('* Not writing because of error')
      for (const error of diagnostic.errors) {
        console.log('')
        console.log(error.location.filename)
        console.log(error.message)
      }
    }
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
    await eventImageGenerator.destroy()
    require('mkdirp').sync('tmp')
    const path = 'tmp/readme-parse-diagnostic.json'
    fs.writeFileSync(path, JSON.stringify(diagnostic, null, 2))
    console.log('* Diagnostic information written to', path)
  }
}

function compareEvents (a, b) {
  return (a.start.year - b.start.year) ||
    (a.start.month - b.start.month) ||
    (a.start.date - b.start.date) ||
    (a.id < b.id ? -1 : 1)
}

function validateJson (json) {
  const usedIds = { }
  for (const event of json) {
    if (usedIds[event.id]) {
      const error/*: any */ = new Error(
        'Validation error at ' + formatLocation(event.declared) + ': ' +
        'Duplicate event ID "' + event.id + '" ' +
        '(previously declared at ' + formatLocation(usedIds[event.id].declared) + ')'
      )
      error.location = event.declared
      throw error
    }
    usedIds[event.id] = event
  }
}

function formatLocation (location) {
  return `${location.filename}`
}

function findImage (filepath) {
  const pngPath = filepath.replace(/\.md$/, '.png')
  if (fs.existsSync(pngPath)) return pngPath
  const jpgPath = filepath.replace(/\.md$/, '.jpg')
  if (fs.existsSync(jpgPath)) return jpgPath
}

function copyEventImage (inFilepath, eventId) {
  const extname = path.extname(inFilepath)
  const outUrl = `event-images/${eventId}${extname}`
  const outFilepath = `public/${outUrl}`
  console.log(`* Copying image "${outFilepath}"`)
  mkdirp.sync(path.dirname(outFilepath))
  fs.copyFileSync(inFilepath, outFilepath)
  return outUrl
}

async function generateEventImage (event) {
  const outUrl = `event-images/${event.id}-generated-v1.png`
  const outFilepath = `public/${outUrl}`
  mkdirp.sync(path.dirname(outFilepath))
  if (!fs.existsSync(outFilepath)) {
    console.log(`* Generating image "${outFilepath}"`)
    await eventImageGenerator.generateImage(event, outFilepath)
  }
  return outUrl
}

main()
