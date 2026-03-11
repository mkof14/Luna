import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import http from 'node:http';

const HOST = '127.0.0.1';
const PORT = 4173;
const BASE_URL = `http://${HOST}:${PORT}`;
const OUTPUT = '.tmp-tests/home-capture-636x886.png';

const waitForServer = async (url, timeoutMs = 60000) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const ok = await new Promise((resolve) => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve(Boolean(res.statusCode && res.statusCode < 500));
      });
      req.on('error', () => resolve(false));
      req.setTimeout(2000, () => {
        req.destroy();
        resolve(false);
      });
    });
    if (ok) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Server did not become ready within ${timeoutMs}ms: ${url}`);
};

const run = (cmd, args, opts = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: false, ...opts });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(' ')} exited with ${code}`));
    });
  });

const devServer = spawn('npm', ['run', 'dev', '--', '--host', HOST, '--port', String(PORT)], {
  stdio: 'inherit',
  shell: false,
});

try {
  await waitForServer(`${BASE_URL}/`);
  await mkdir('.tmp-tests', { recursive: true });

  const ref = encodeURIComponent(process.env.HOME_REF || '/images/home-reference.png');
  const target = `${BASE_URL}/?calibrate=1&hide_calibration_panel=1&ref=${ref}`;

  await run('npx', [
    'playwright',
    'screenshot',
    '--viewport-size=636,886',
    target,
    OUTPUT,
  ]);

  console.log(`Saved: ${OUTPUT}`);
  console.log(`Compared against ref: ${decodeURIComponent(ref)}`);
} finally {
  devServer.kill('SIGTERM');
}
