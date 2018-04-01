const puppeteer = require('puppeteer')
let browser
let page
let previousRendering

async function initialize () {
  previousRendering = Promise.resolve()
}

async function destroy () {
  if (browser) await browser.close()
}

function generateImage (event, outputFilepath) {
  const currentRendering = previousRendering
    .then(async () => {
      if (!page) {
        browser = await puppeteer.launch()
        page = await browser.newPage()
        await page.goto(`file://${require.resolve('./imageTemplate.html')}`, {
          waitUntil: 'networkidle2'
        })
        await page.setViewport({
          width: 1200,
          height: 1200
        })
      }

      await page.evaluate(title => {
        window.setTitle(title)
      }, event.title)
      await page.screenshot({ path: outputFilepath })
    })
  previousRendering = currentRendering
  return currentRendering
}

exports.generateImage = generateImage
exports.initialize = initialize
exports.destroy = destroy
