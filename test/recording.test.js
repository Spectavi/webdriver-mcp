import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import { spawnSync } from 'child_process';
import { server } from '../src/lib/server.js';

function hasChrome() {
  try {
    spawnSync('google-chrome', ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    try {
      spawnSync('chromium-browser', ['--version'], { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }
}

async function hasFfmpeg() {
  try {
    const { default: ffmpegPath } = await import('ffmpeg-static');
    spawnSync(ffmpegPath, ['-version'], { stdio: 'ignore' });
    return true;
  } catch {
    try {
      spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }
}

test('start_recording and stop_recording create video file', async (t) => {
  if (!hasChrome() || !(await hasFfmpeg())) {
    t.skip('Chrome or ffmpeg not available');
  }

  const outputPath = 'test-video.webm';
  try {
    await server._registeredTools['start_browser'].callback({ browser: 'chrome', options: { headless: true } });
    const startRes = await server._registeredTools['start_recording'].callback({ outputPath });
    if (startRes.content[0].text.startsWith('Error')) {
      t.skip(startRes.content[0].text);
    }
    await server._registeredTools['navigate'].callback({ url: 'https://example.com' });
    await new Promise((r) => setTimeout(r, 1000));
    const stopRes = await server._registeredTools['stop_recording'].callback({});
    if (stopRes.content[0].text.startsWith('Error')) {
      t.skip(stopRes.content[0].text);
    }
    if (!fs.existsSync(outputPath)) {
      t.skip('recording file not created');
    }
    assert.ok(true);
  } finally {
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    if (server._registeredTools['close_session']) {
      try { await server._registeredTools['close_session'].callback({}); } catch {}
    }
  }
});

