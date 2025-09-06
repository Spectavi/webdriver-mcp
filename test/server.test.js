import test from 'node:test';
import assert from 'node:assert/strict';
import { getLocator, server, state, cleanup } from '../src/lib/server.js';

test('getLocator returns CSS selector', () => {
  const locator = getLocator('css', '#main');
  assert.strictEqual(locator.using, 'css selector');
  assert.strictEqual(locator.value, '#main');
});

test('getLocator throws on unsupported strategy', () => {
  assert.throws(() => getLocator('unsupported', 'value'), /Unsupported locator strategy/);
});

test('server registers start_browser tool', () => {
  assert.ok(server._registeredTools['start_browser']);
});

test('cleanup clears state and exits', async () => {
  let exitCode;
  const originalExit = process.exit;
  process.exit = (code) => { exitCode = code; };
  state.drivers.set('sess', { quit: () => Promise.resolve() });
  state.currentSession = 'sess';
  await cleanup();
  assert.strictEqual(state.drivers.size, 0);
  assert.strictEqual(state.currentSession, null);
  assert.strictEqual(exitCode, 0);
  process.exit = originalExit;
});
