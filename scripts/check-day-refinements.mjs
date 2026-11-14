import { writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'

const output = process.env.DAY_SCREENSHOT_DIR
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


async function hover(selector) {
  const point = await evaluate(`(() => { const r = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return { x:r.x+r.width/2,y:r.y+r.height/2 }; })()`)
  await send('Input.dispatchMouseEvent', {type:'mouseMoved', ...point})
  await delay(300)
  return point
}
async function scale(selector) {
  return evaluate(`getComputedStyle(document.querySelector(${JSON.stringify(selector)})).scale`)
}
try {
  await send('Page.enable')
  await send('Runtime.enable')
  await size(1360, 1000)
  await send('Page.navigate', {url:'http://127.0.0.1:5173/calendar/2026-11-10'})
  await ready()
  const card = 'article[aria-label="Informações por sala"]'
  const header = 'thead tr'
  const row = 'tbody tr'
  const clip = await evaluate(`getComputedStyle(document.querySelector('thead tr')).clipPath`)
  assert.match(clip, /^inset\(0px round [1-9]/, 'rounded clipping on the continuous header background')
  assert.notEqual(await evaluate(`getComputedStyle(document.querySelector('thead tr')).backgroundImage`), 'none')
  await hover(header)
  assert.equal(await scale(header), 'none', 'header stays still')
  assert.equal(await scale(card), 'none', 'card stays still')
  await hover(row)
  assert.equal(await scale(row), '1.02', 'data row uses card hover scale')
  assert.equal(await scale(card), 'none', 'row hover cannot scale its parent')
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('tbody tr')).boxShadow`), 'none', 'rows have no shadow')
  assert.equal(await scale('tbody tr:nth-child(2)'), 'none', 'other rows stay still')
  await hover('h1')
  assert.equal(await scale(row), 'none')
  const pointer = await hover('svg rect[aria-label="09:00 — 2 consultas"]')
  assert.equal(await evaluate(`document.querySelector('[role="tooltip"]').textContent.trim()`), '09:00 — 2 consultas')
  assert.equal(await evaluate(`document.querySelector('svg title, svg [title]') === null`), true)
  async function checkPopupPosition(point) {
    const popup = await evaluate(`(() => { const r = document.querySelector('[role="tooltip"]').getBoundingClientRect(); return { center:r.x+r.width/2,bottom:r.bottom }; })()`)
    assert.ok(Math.abs(popup.center - point.x) < 1, 'popup centered above mouse')
    assert.ok(popup.bottom < point.y && point.y - popup.bottom < 20, 'popup just above mouse')
  }
  await checkPopupPosition(pointer)
  const movedPointer = {x:pointer.x,y:pointer.y+10}
  await send('Input.dispatchMouseEvent', {type:'mouseMoved', ...movedPointer})
  await delay(100)
  await checkPopupPosition(movedPointer)
  if (output) {
    const shot = await send('Page.captureScreenshot', {format:'png',captureBeyondViewport:true})
    await writeFile(`${output}/day-refinements.png`, Buffer.from(shot.data,'base64'))
  }
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('[role="tooltip"]')).transitionDuration`), '0.15s')
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('[role="tooltip"]')).opacity`), '1')
  await send('Input.dispatchMouseEvent', {type:'mouseMoved',x:0,y:0})
  await delay(50)
  const fading = await evaluate(`Number(getComputedStyle(document.querySelector('[role="tooltip"]')).opacity)`)
  assert.ok(fading > 0 && fading < 1, 'fade out has intermediate opacity')
  await delay(200)
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('[role="tooltip"]')).opacity`), '0')
  await send('Input.dispatchMouseEvent', {type:'mouseMoved',...movedPointer})
  await delay(50)
  const entering = await evaluate(`Number(getComputedStyle(document.querySelector('[role="tooltip"]')).opacity)`)
  assert.ok(entering > 0 && entering < 1, 'fade in has intermediate opacity')
  await delay(200)
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('[role="tooltip"]')).opacity`), '1')
  await send('Emulation.setEmulatedMedia', {features:[{name:'prefers-reduced-motion',value:'reduce'}]})
  await hover(row)
  assert.equal(await scale(row), 'none', 'reduced motion disables scale')
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('tbody tr')).transitionDuration`), '0s')
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('[role="tooltip"]')).transitionProperty`), 'none')
  assert.deepEqual(errors, [])
  console.log(JSON.stringify({status:'passed',roundedHeader:clip,rowHover:1.02,stationaryCard:true,reducedMotion:true,customPopup:true}))
} finally { socket.close() }
