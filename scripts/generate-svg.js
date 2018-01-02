// Generates SVG file from `public/calendar.json`

const data = require('../public/calendar')
const totalWidth = 200
const totalHeight = 185
const hPadding = 10
const cellWidth = (totalWidth - 2 * hPadding) / 7
const calendarStartY = 36
const cellHeight = 24

const occupiedCells = { }
const occupationKey = date => `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
for (const event of data) {
  const startDate = new Date(event.start.year, event.start.month - 1, event.start.date)
  const endDate = event.end ? new Date(event.end.year, event.end.month - 1, event.end.date) : null
  const date = new Date(+startDate)
  do {
    const key = occupationKey(date)
    occupiedCells[key] = (occupiedCells[key] || 0) + 1
    date.setDate(date.getDate() + 1)
  } while (date <= endDate)
}

const monthName = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

function generateSVG (year, month) {
  const firstDay = new Date(year, month, 1, 0, 0, 0).getDay()
  const lastDate = new Date(year, month + 1, 0, 0, 0, 0).getDate()

  const svg = `<?xml version="1.0"?>
  <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
  <svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">
    <text x="${totalWidth / 2}" y="${24}" font-weight="bold" font-family="Helvetica, Arial, sans-serif" font-size="14" text-anchor="middle" fill="#333">${monthName[month]} ${year}</text>
    ${renderCells()}
  </svg>`
  return svg

  function getPosition (date) {
    const day = (firstDay + (date - 1)) % 7
    const row = ~~((firstDay + (date - 1)) / 7)
    const x = hPadding + day * cellWidth
    const y = calendarStartY + row * cellHeight
    return { x, y }
  }

  function renderCells () {
    return Array(lastDate).fill().map((_, i) => i + 1).map(date => {
      const { x, y } = getPosition(date)
      const count = occupiedCells[occupationKey(new Date(year, month, date))] || 0
      const cellColor = count <= 0 ? '#eee'
        : count <= 1 ? '#c6e48b'
        : count <= 2 ? '#7bc96f'
        : count <= 3 ? '#239a3b'
        : '#196127'
      return [
        `<rect x="${x + 1}" y="${y + 1}" width="${cellWidth - 2}" height="${cellHeight - 2}" fill="${cellColor}" />`,
        `<text x="${x + cellWidth / 2}" y="${y + 16}" font-family="Helvetica, Arial, sans-serif" font-size="12" font-weight="${count > 0 ? 'bold' : 'normal'}" fill="#333333" text-anchor="middle">${date}</text>`
      ].join('\n')
    }).join('\n')
  }
}

require('child_process').execSync('mkdir -p public/generated/calendar-images')

for (let year = 2018; year <= 2018; year++) {
  for (let month = 0; month <= 11; month++) {
    const svg = generateSVG(year, month)
    const path = `public/generated/calendar-images/${year}-${String(month + 1).padStart(2, '0')}.svg`
    require('fs').writeFileSync(path, svg)
    console.log('* Generated', path)
  }
}
