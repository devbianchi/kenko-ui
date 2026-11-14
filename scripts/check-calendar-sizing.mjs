import { writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'

const output = process.env.CALENDAR_SCREENSHOT_DIR
// Requires Vite on 5173 and a headless Chrome debugging endpoint on 9228.
const target = await fetch('http://127.0.0.1:9228/json/new?about:blank', { method: 'PUT' }).then(r => r.json())
const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject })
let sequence = 0
const pending = new Map()
const errors = []
socket.onmessage = ({ data }) => {
  const message = JSON.parse(data)
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text)
  const callback = pending.get(message.id)
  if (!callback) return
  pending.delete(message.id)
  if (message.error) callback.reject(message.error)
  else callback.resolve(message.result)
}
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence
    pending.set(id, { resolve, reject })
    socket.send(JSON.stringify({ id, method, params }))
  })
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
  return result.result.value
}
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
async function ready() {
  for (let i = 0; i < 100; i++) {
    if (await evaluate('!!document.querySelector("header")')) break
    await delay(200)
  }
  await evaluate('document.fonts.ready.then(() => true)')
  assert.equal(await evaluate('!!document.querySelector("header")'), true)
}
async function size(width, height) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false })
  await delay(300)
}

const results = []
try {
  await send('Page.enable')
  await send('Runtime.enable')
  for (const [width, height, month] of [
    [1360, 768, '2026-11'], [1360, 1400, '2026-11'],
    [2720, 1536, '2026-11'], [1360, 768, '2026-08'],
    [390, 844, '2026-11'], [390, 844, '2026-08'],
  ]) {
    await size(width, height)
    await send('Page.navigate', { url: `http://127.0.0.1:5173/calendar?month=${month}` })
    await ready()
    const geometry = await evaluate(`(() => {
      const section = document.querySelector('section[aria-label^="Calendário"]');
      const cards = [...section.querySelectorAll('a')];
      const bounds = element => { const r = element.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right}; };
      return {cards: cards.map(bounds), panel:bounds(section), overflow:document.documentElement.scrollWidth > innerWidth,
        contentFits: cards.every(card => [...card.querySelectorAll('span')].every(span => {
          const c = bounds(card), s = bounds(span);
          return s.x >= c.x && s.right <= c.right && s.y >= c.y && s.bottom <= c.bottom;
        }))};
    })()`)
    assert.equal(geometry.cards.length, month === '2026-08' ? 42 : 35)
    assert.equal(geometry.overflow, false, 'no horizontal page overflow')
    assert.equal(geometry.contentFits, true, 'all labels contained')
    const first = geometry.cards[0]
    for (let column = 0; column < 6; column++) {
      assert.ok(geometry.cards[column].right < geometry.cards[column + 1].x, 'columns cannot overlap')
    }
    for (const card of geometry.cards) {
      assert.ok(Math.abs(card.height - first.height) < 1, 'equal card heights')
      assert.ok(card.bottom <= geometry.panel.bottom, 'panel contains every week')
      assert.ok(card.right <= geometry.panel.right, 'panel contains all seven columns')
    }
    if (width >= 640) assert.ok(Math.abs(first.width / first.height - 1.5) < 0.02, 'desktop 3:2 aspect ratio')
    else assert.ok(first.height >= 56, 'mobile minimum height')
    results.push({width,height,month,card:first,panel:geometry.panel})
    if (output) {
      const shot = await send('Page.captureScreenshot', {format:'png',captureBeyondViewport:true})
      await writeFile(`${output}/calendar-${width}-${height}-${month}.png`, Buffer.from(shot.data,'base64'))
    }
  }
  assert.equal(results[0].card.height, results[1].card.height, 'viewport height cannot stretch cards')
  assert.equal(results[0].card.height, results[3].card.height, 'six weeks cannot compress cards')
  assert.ok(results[3].panel.height > results[0].panel.height, 'extra week grows panel')
  assert.deepEqual(errors, [])
  console.log(JSON.stringify({status:'passed',results}, null, 2))
} finally { socket.close() }
