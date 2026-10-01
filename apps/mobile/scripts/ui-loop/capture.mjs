#!/usr/bin/env node
/**
 * Design-verification capture — the "screenshot" half of the UI match loop.
 *
 * Why the web target instead of a simulator
 * ─────────────────────────────────────────
 * `design/auth_screen_design.png` draws a 360x800 dp screen (732x1604 px of
 * screen area inside the device frame). Matching it used to mean screenshotting
 * a simulator, but the dev machines here have no Android SDK and no macOS — see
 * the "Development build" note in `apps/mobile/README.md`. So this script
 * renders the same screens through `expo start --web` at those exact metrics:
 *
 *     Emulation.setDeviceMetricsOverride({ width: 360, height: 800, dsf: 2.0333 })
 *
 * which is the same dp grid the design was drawn on. `react-native-web` + the
 * NativeWind classes produce the same flex layout as native, so a layout
 * difference in the web render is a difference in the screen; the caveats that
 * remain are listed in `scripts/ui-loop/README.md`.
 *
 * It drives Chromium over the DevTools Protocol directly (Node's global
 * `WebSocket` + `fetch`), so there is no `puppeteer`/`playwright` dependency to
 * keep SDK-compatible.
 *
 * Output
 * ──────
 *   <out>.png            — viewport screenshot at width*dsf x height*dsf
 *   <out>.geometry.json  — computed dp rects of every probed element, so the
 *                          layout can be compared numerically, not just by eye
 *
 * Usage
 * ─────
 *   node scripts/ui-loop/capture.mjs \
 *     --url http://localhost:8081/sign-in \
 *     --out ../shots/sign-in.png
 */

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const DEFAULTS = {
  chrome: process.env.CHROME_BIN ?? '/snap/bin/chromium',
  url: 'http://localhost:8081/sign-in',
  out: 'shot.png',
  width: 360,
  height: 800,
  dsf: 2.0333,
  port: 9333,
  settle: 4000,
};

/** Text (and image) probes — every string the auth design draws, in order. */
const PROBES = [
  { name: 'logoMark', img: true, alt: 'SBS Field Service' },
  { name: 'title', text: 'SBS' },
  { name: 'subtitle', text: 'Field Service' },
  { name: 'tagline', text: 'Powering Sri Lanka\u2019s\nInfrastructure' },
  { name: 'welcome', text: 'Welcome Back' },
  { name: 'welcomeSub', text: 'Sign in to your account' },
  { name: 'field1', placeholder: 'Email or Phone Number' },
  { name: 'fieldHint', text: 'Use the email or phone from your invite.' },
  { name: 'cta', text: 'Sign In' },
  { name: 'google', text: 'Continue with Google' },
  { name: 'apple', text: 'Continue with Apple' },
  { name: 'invite', text: 'Access by invitation only' },
];

function parseArgs(argv) {
  const opts = { ...DEFAULTS };
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i].replace(/^--/, '');
    if (!(key in opts)) throw new Error(`unknown flag ${argv[i]}`);
    opts[key] = /^(chrome|url|out)$/.test(key) ? argv[i + 1] : Number(argv[i + 1]);
  }
  return opts;
}

/** Minimal CDP client over the target's websocket. */
class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      const pending = this.pending.get(msg.id);
      if (!pending) return;
      this.pending.delete(msg.id);
      if (msg.error) pending.reject(new Error(JSON.stringify(msg.error)));
      else pending.resolve(msg.result);
    });
  }

  static async connect(wsUrl) {
    const ws = new WebSocket(wsUrl);
    await new Promise((res, rej) => {
      ws.addEventListener('open', res, { once: true });
      ws.addEventListener('error', () => rej(new Error(`cannot open ${wsUrl}`)), { once: true });
    });
    return new Cdp(ws);
  }

  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  /** Evaluate an expression and return its JSON value. */
  async eval(expression) {
    const { result, exceptionDetails } = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (exceptionDetails) {
      throw new Error(`${exceptionDetails.text} ${exceptionDetails.exception?.description ?? ''}`);
    }
    return result.value;
  }

  close() {
    this.ws.close();
  }
}

async function waitForDevTools(port, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return await res.json();
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Chrome DevTools did not answer on port ${port}`);
}

/** In-page: resolve the probes to viewport rects plus the type that drew them. */
const geometryExpression = `(() => {
  const probes = ${JSON.stringify(PROBES)};
  const all = [...document.querySelectorAll('body *')];
  const round = (n) => Math.round(n * 100) / 100;

  const textOf = (el) => (el.textContent || '').replace(/\\s+/g, ' ').trim();
  const findText = (text) => {
    const want = text.replace(/\\s+/g, ' ').trim();
    const hits = all.filter((el) => textOf(el) === want);
    // Deepest match wins — the leaf node that actually holds the glyphs.
    return hits.length ? hits[hits.length - 1] : null;
  };
  const findPlaceholder = (p) => all.find((el) => el.tagName === 'INPUT' && el.placeholder === p) || null;

  const describe = (name, el) => {
    if (!el) return { name, missing: true };
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      name,
      tag: el.tagName.toLowerCase(),
      x: round(r.x), y: round(r.y), w: round(r.width), h: round(r.height),
      right: round(r.right), bottom: round(r.bottom),
      fontSize: cs.fontSize,
      lineHeight: cs.lineHeight,
      fontFamily: cs.fontFamily.split(',')[0].replace(/["']/g, ''),
      fontWeight: cs.fontWeight,
      letterSpacing: cs.letterSpacing,
      color: cs.color,
      background: cs.backgroundColor,
      border: cs.borderTopWidth + ' ' + cs.borderTopColor,
      radius: cs.borderTopLeftRadius,
      objectFit: cs.objectFit,
      src: el.tagName === 'IMG' ? (el.currentSrc || el.src || '').split('/').pop() : undefined,
    };
  };

  const boxes = probes.map((p) => {
    if (p.img) return describe(p.name, document.querySelector('img[alt="' + p.alt + '"]'));
    if (p.placeholder) return describe(p.name, findPlaceholder(p.placeholder));
    return describe(p.name, findText(p.text));
  });

  // Every image on the page — the backdrop and the brand mark reach the DOM as
  // <img>, and their rect tells us whether \`className\` reached expo-image.
  const images = [...document.querySelectorAll('img')].map((img) => {
    const r = img.getBoundingClientRect();
    return {
      src: (img.currentSrc || img.src || '').split('/').pop(),
      natural: img.naturalWidth + 'x' + img.naturalHeight,
      x: round(r.x), y: round(r.y), w: round(r.width), h: round(r.height),
      objectFit: getComputedStyle(img).objectFit,
    };
  });

  return {
    viewport: { width: window.innerWidth, height: window.innerHeight },
    document: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight },
    fonts: {
      status: document.fonts.status,
      regular: document.fonts.check('16px Manrope_400Regular'),
      semibold: document.fonts.check('16px Manrope_600SemiBold'),
    },
    boxes,
    images,
  };
})()`;

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const outPath = resolve(opts.out);
  mkdirSync(dirname(outPath), { recursive: true });

  const chrome = spawn(
    opts.chrome,
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--hide-scrollbars',
      '--disable-lcd-text', // grayscale AA: closer to the mock than subpixel AA
      '--force-color-profile=srgb',
      '--font-render-hinting=none',
      `--remote-debugging-port=${opts.port}`,
      '--no-first-run',
      '--no-default-browser-check',
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  );
  let chromeErr = '';
  chrome.stderr.on('data', (d) => (chromeErr += d.toString()));

  let cdp;
  try {
    await waitForDevTools(opts.port);

    // `/json/new` needs PUT on modern Chrome; fall back to the blank target.
    const target = await fetch(`http://127.0.0.1:${opts.port}/json/new?about:blank`, { method: 'PUT' })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
    const page = target ?? (await (await fetch(`http://127.0.0.1:${opts.port}/json/list`)).json())[0];
    cdp = await Cdp.connect(page.webSocketDebuggerUrl);

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: opts.width,
      height: opts.height,
      deviceScaleFactor: opts.dsf,
      mobile: true,
      screenWidth: opts.width,
      screenHeight: opts.height,
    });
    await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });

    await cdp.send('Page.navigate', { url: opts.url });

    // Wait for the Metro bundle to mount, then for Manrope to be in use.
    const deadline = Date.now() + 90000;
    let ready = false;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 500));
      const state = await cdp
        .eval("({ ready: document.readyState, mounted: !!document.querySelector('#root *') })")
        .catch(() => null);
      if (state?.ready === 'complete' && state.mounted) {
        ready = true;
        break;
      }
    }
    if (!ready) throw new Error('app never mounted — is `npx expo start --web` running?');

    await cdp.eval('document.fonts.ready.then(() => true)');
    await new Promise((r) => setTimeout(r, opts.settle));

    const geometry = await cdp.eval(geometryExpression);
    const shot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
      clip: { x: 0, y: 0, width: opts.width, height: opts.height, scale: 1 },
    });

    writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
    writeFileSync(`${outPath}.geometry.json`, `${JSON.stringify(geometry, null, 2)}\n`);

    console.log(`wrote ${outPath}`);
    console.log(`  viewport ${geometry.viewport.width}x${geometry.viewport.height} @ ${opts.dsf}x`);
    console.log(`  fonts ${JSON.stringify(geometry.fonts)}`);
    for (const box of geometry.boxes) {
      if (box.missing) {
        console.log(`  ${box.name.padEnd(11)} MISSING`);
        continue;
      }
      console.log(
        `  ${box.name.padEnd(11)} y ${String(box.y).padStart(8)}..${String(box.bottom).padEnd(8)}` +
          ` h ${String(box.h).padStart(7)}  x ${String(box.x).padStart(7)}..${String(box.right).padEnd(8)}` +
          ` ${box.fontSize}/${box.lineHeight} ${box.fontFamily}`,
      );
    }
    for (const img of geometry.images) {
      console.log(`  img ${img.src} natural ${img.natural} → ${img.w}x${img.h} @ ${img.x},${img.y} fit:${img.objectFit}`);
    }
  } finally {
    cdp?.close();
    chrome.kill('SIGKILL');
    const noise = chromeErr.split('\n').filter((l) => /FATAL/.test(l)).join('\n');
    if (noise) process.stderr.write(`${noise}\n`);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

