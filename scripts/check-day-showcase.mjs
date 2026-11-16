import assert from 'node:assert/strict'

const origin = process.env.DAY_SHOWCASE_ORIGIN ?? "http://127.0.0.1:5186"
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


async function open(path) {
  await send('Page.navigate', {url: origin + path})
  await ready()
}
async function point(selector, fraction = 0.5) {
  return evaluate(`(() => {const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height*${fraction}}})()`)
}
async function mouse(type, position) {
  await send('Input.dispatchMouseEvent', {type,...position,...(type === 'mouseMoved' ? {} : {button:'left',clickCount:1})})
}
async function key(key) {
  for (const type of ['keyDown','keyUp']) await send('Input.dispatchKeyEvent',{type,key,code:key,windowsVirtualKeyCode:key==='Tab'?9:27})
}
async function checkAnchor(position) {
  const popup = await evaluate(`(() => {const e=document.querySelector('[role="tooltip"]'); const r=e.getBoundingClientRect();return {hidden:e.ariaHidden,x:r.x+r.width/2,y:r.bottom}})()`)
  assert.equal(popup.hidden, 'false')
  assert.ok(Math.abs(popup.x-position.x)<1 && position.y-popup.y>0 && position.y-popup.y<20)
}
async function header() {
  return evaluate(`(() => {const menu=document.querySelector('header nav');if(!menu)throw Error(location.href+' '+document.body.innerText.slice(0,600));const nav=menu.parentElement.parentElement;const brand=nav.nextElementSibling;const css=getComputedStyle(nav); return {w:nav.getBoundingClientRect().width,brand:brand.getBoundingClientRect().width,top:brand.getBoundingClientRect().top,gap:parseFloat(css.marginRight)+parseFloat(css.marginBottom),opacity:Number(css.opacity),duration:css.transitionDuration,inert:nav.inert}})()`)
}
const showcase = 'header a[href="/showcase"]'
const back = 'header a[aria-label="Kenko, página inicial"]'
const clickLink = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`)
try {
  await send('Page.enable')
  await send('Runtime.enable')
  await size(1360,768)
  await open('/calendar/2026-02-30')
  assert.equal(await evaluate("document.querySelector('main h1').textContent"),'Data Inválida :/')
  assert.equal(await evaluate("!!document.querySelector('main article,main figure,main table')"),false)
  const link='main a[href="/calendar"]'
  const button=await point(link)
  await mouse('mouseMoved',button); await delay(230)
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('main a')).scale`),'1.02')
  await mouse('mousePressed',button); await delay(230)
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('main a')).scale`),'1')
  await mouse('mouseReleased',button); await delay(250)
  assert.equal(await evaluate("document.querySelector('main h1').textContent"),'Calendário')
  await open('/calendar/2026-11-10')
  const bar='rect[aria-label="09:00 — 2 consultas"]'
  await mouse('mouseMoved',await point(bar));await delay(250)
  for (const f of [0.85,0.15,0.15]) {
    const pos=await point(bar,f)
    await mouse('mouseMoved',pos)
    await mouse('mousePressed',pos);await mouse('mouseReleased',pos)
    await checkAnchor(pos)
    await key('Escape')
    assert.equal(await evaluate("document.querySelector('[role=tooltip]').ariaHidden"),'true')
  }
  await key('Tab')
  assert.equal(await evaluate('document.activeElement.tagName'),'rect')
  await checkAnchor(await point('rect:focus',0))
  await key('Escape')
  assert.equal(await evaluate("document.querySelector('[role=tooltip]').ariaHidden"),'true')
  for (const width of [1360,390]) {
    await size(width,768)
    await open('/home')
    const start=await header()
    assert.equal(start.duration,'0.4s')
    await clickLink(showcase);await delay(160)
    const mid=await header()
    await delay(420)
    const end=await header()
    assert.ok(mid.w>0 && mid.w<start.w && mid.opacity>0 && mid.opacity<1)
    assert.equal(end.w,0);assert.equal(end.gap,0);assert.equal(end.inert,true)
    if(width>=1000) assert.ok(start.brand<mid.brand && mid.brand<end.brand)
    else assert.ok(start.top>mid.top && mid.top>end.top)
    await key('Tab')
    assert.equal(await evaluate('Boolean(document.activeElement.closest("nav"))'),false)
    await clickLink(back);await delay(160)
    const opening=await header()
    assert.ok(opening.w>0 && opening.w<start.w)
    await delay(430)
    assert.equal((await header()).w,start.w)
    await clickLink(showcase);await delay(130)
    const reversing=await header()
    assert.ok(reversing.w>0 && reversing.w<start.w)
    await clickLink(back);await delay(450)
    assert.equal((await header()).w,start.w)
    console.log({width,start,mid,end,opening,reversing})
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]})
    await clickLink(showcase)
    assert.equal((await header()).w,0)
    await clickLink(back)
    assert.equal((await header()).w,start.w)
    await send('Emulation.setEmulatedMedia',{features:[]})
  }
  assert.deepEqual(errors,[])
  console.log('PASS: data inválida, botão, cliques, Tab, Escape e cabeçalho.')
} finally { socket.close() }
