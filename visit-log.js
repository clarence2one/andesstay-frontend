// AndesStay visit-log proxy: registra cada visita (IP, user-agent, hora)
// y reenvía el tráfico al dev server de Angular.
const http = require('http');
const net = require('net');
const fs = require('fs');
const path = require('path');

const TARGET_HOST = '127.0.0.1';
const TARGET_PORT = 4300;
const PORT = 4200;
const LOG_FILE = path.join(__dirname, 'visits.log');
const MAX_LINES = 200;

function clientIp(req) {
  const cf = req.headers['cf-connecting-ip'];
  const xff = req.headers['x-forwarded-for'];
  const ip = cf || (xff ? xff.split(',')[0].trim() : '') || req.socket.remoteAddress || '';
  return ip.replace(/^::ffff:/, '');
}

function isLocal(ip) {
  return ip.startsWith('127.') || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.1');
}

function appendLog(entry) {
  fs.appendFile(LOG_FILE, JSON.stringify(entry) + '\n', () => {});
}

function lastLines(n, cb) {
  fs.readFile(LOG_FILE, 'utf8', (err, data) => {
    if (err) return cb([]);
    const lines = data.split('\n').filter(Boolean);
    cb(lines.slice(-n));
  });
}

function renderVisits(res) {
  lastLines(150, (lines) => {
    const rows = lines.reverse().map((line) => {
      try {
        const e = JSON.parse(line);
        const time = new Date(e.time).toLocaleString('es-CL');
        const ua = (e.ua || '').match(/(Chrome\/[\d.]+|Safari\/[\d.]+|Firefox\/[\d.]+|Edg\/[\d.]+|Instagram\/[\d.]+|Android\s[\d.]+|iPhone|iPad|Instagram)[^;)]*/i);
        const device = ua ? ua[1] : (e.ua || 'desconocido').slice(0, 80);
        let who = e.ip;
        let cls = '';
        if (e.type === 'login') {
          who = e.email || 'login (sin email)';
          cls = ' style="color:#5eead4;font-weight:700"';
        }
        const route = e.type === 'login' ? '🔐 INICIO DE SESIÓN' : `${e.method} ${e.url}`;
        return `<tr><td>${time}</td><td${cls}>${who}</td><td>${device}</td><td>${route}</td></tr>`;
      } catch {
        return '';
      }
    }).join('');
    const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>AndesStay · Visitas</title>
<style>body{font-family:Segoe UI,Arial,sans-serif;background:#0b1f3a;color:#e2e8f0;padding:1.5rem}table{border-collapse:collapse;width:100%;font-size:.85rem}th{text-align:left;color:#14b8a6;text-transform:uppercase;font-size:.72rem;letter-spacing:.5px}td,th{padding:.5rem .6rem;border-bottom:1px solid rgba(255,255,255,.08)}h1{color:#fff}h1 span{color:#f59e0b}</style></head>
<body><h1>Andes<span>Stay</span> · Registro de visitas</h1><p>Actualiza la página para ver visitas nuevas.</p>
<table><thead><tr><th>Fecha</th><th>IP</th><th>Dispositivo/Navegador</th><th>Ruta</th></tr></thead><tbody>${rows || '<tr><td colspan="4">Sin visitas aún.</td></tr>'}</tbody></table>
<p style="margin-top:1rem;font-size:.75rem;color:#7d8ea6">Registrado localmente solo en este PC.</p></body></html>`;
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(html);
  });
}

const server = http.createServer((req, res) => {
  const ip = clientIp(req);

  if (req.url.startsWith('/__visits')) {
    if (!isLocal(ip)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    renderVisits(res);
    return;
  }

  if (req.method === 'POST' && req.url === '/__who') {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
        appendLog({
          time: new Date().toISOString(),
          ip,
          ua: req.headers['user-agent'] || '',
          method: req.method,
          url: req.url,
          type: 'login',
          name: body.name || '',
          email: body.email || ''
        });
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch {
        res.writeHead(400);
        res.end('bad json');
      }
    });
    return;
  }

  appendLog({ time: new Date().toISOString(), ip, ua: req.headers['user-agent'] || '', method: req.method, url: req.url });

  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    const payload = Buffer.concat(chunks);
    const headers = { ...req.headers };
    headers.host = `${TARGET_HOST}:${TARGET_PORT}`;
    delete headers['connection'];
    delete headers['proxy-connection'];

    const pReq = http.request(
      { host: TARGET_HOST, port: TARGET_PORT, method: req.method, path: req.url, headers, agent: false },
      (pRes) => {
        res.writeHead(pRes.statusCode, pRes.headers);
        pRes.pipe(res);
      }
    );
    pReq.on('error', () => {
      if (!res.headersSent) {
        res.writeHead(502);
        res.end('proxy error');
      }
    });
    pReq.end(payload);
  });
});

server.on('upgrade', (req, socket, head) => {
  const target = net.connect(TARGET_PORT, TARGET_HOST, () => {
    target.write(head);
    target.write(
      req.method + ' ' + req.url + ' HTTP/1.1\r\n' +
      Object.entries(req.headers).map(([k, v]) => `${k}: ${v}\r\n`).join('') +
      '\r\n'
    );
  });
  target.on('error', () => socket.destroy());
  socket.on('error', () => target.destroy());
  target.pipe(socket);
  socket.pipe(target);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`AndesStay visit logger on :${PORT} -> ${TARGET_HOST}:${TARGET_PORT}`);
});