import test from 'node:test';
import assert from 'node:assert/strict';
import { server, state } from '../src/lib/server.js';

// Mock driver for testing pagination without requiring a real browser
const createMockDriver = () => ({
  getPageSource: () => Promise.resolve('A'.repeat(120000)), // 120k characters
  manage: () => ({
    logs: () => ({
      get: (type) => {
        if (type === 'browser') {
          // Return 250 mock console logs
          return Promise.resolve(
            Array.from({ length: 250 }, (_, i) => ({
              level: 'INFO',
              message: `Log entry ${i + 1}`,
              timestamp: Date.now() + i
            }))
          );
        } else if (type === 'performance') {
          // Return 300 mock performance logs
          return Promise.resolve(
            Array.from({ length: 300 }, (_, i) => ({
              message: JSON.stringify({
                message: {
                  method: 'Network.requestWillBeSent',
                  params: { requestId: `req${i + 1}` }
                }
              }),
              timestamp: Date.now() + i
            }))
          );
        }
        return Promise.resolve([]);
      }
    })
  }),
  takeScreenshot: () => Promise.resolve('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='),
  quit: () => Promise.resolve()
});

test('get_page_source returns first page by default', async () => {
  const sessionId = 'test-pagination-1';
  state.drivers.set(sessionId, createMockDriver());
  state.currentSession = sessionId;

  try {
    const result = await server._registeredTools['get_page_source'].callback({});
    const text = result.content[0].text;

    assert.ok(text.includes('[Page 1/3'));
    assert.ok(text.includes('Characters 1-50000 of 120000'));
    assert.strictEqual(text.split('\n\n')[1].length, 50000); // Content should be 50000 chars
  } finally {
    state.drivers.delete(sessionId);
    state.currentSession = null;
  }
});

test('get_page_source returns requested page', async () => {
  const sessionId = 'test-pagination-2';
  state.drivers.set(sessionId, createMockDriver());
  state.currentSession = sessionId;

  try {
    const result = await server._registeredTools['get_page_source'].callback({ page: 2 });
    const text = result.content[0].text;

    assert.ok(text.includes('[Page 2/3'));
    assert.ok(text.includes('Characters 50001-100000 of 120000'));
  } finally {
    state.drivers.delete(sessionId);
    state.currentSession = null;
  }
});

test('get_page_source returns last page correctly', async () => {
  const sessionId = 'test-pagination-3';
  state.drivers.set(sessionId, createMockDriver());
  state.currentSession = sessionId;

  try {
    const result = await server._registeredTools['get_page_source'].callback({ page: 3 });
    const text = result.content[0].text;

    assert.ok(text.includes('[Page 3/3'));
    assert.ok(text.includes('Characters 100001-120000 of 120000'));
    assert.strictEqual(text.split('\n\n')[1].length, 20000); // Last page should be 20000 chars
  } finally {
    state.drivers.delete(sessionId);
    state.currentSession = null;
  }
});

test('get_page_source handles invalid page number', async () => {
  const sessionId = 'test-pagination-4';
  state.drivers.set(sessionId, createMockDriver());
  state.currentSession = sessionId;

  try {
    const result = await server._registeredTools['get_page_source'].callback({ page: 99 });
    const text = result.content[0].text;

    assert.ok(text.includes('Invalid page number'));
    assert.ok(text.includes('Total pages: 3'));
  } finally {
    state.drivers.delete(sessionId);
    state.currentSession = null;
  }
});

test('get_page_source respects custom pageSize', async () => {
  const sessionId = 'test-pagination-5';
  state.drivers.set(sessionId, createMockDriver());
  state.currentSession = sessionId;

  try {
    const result = await server._registeredTools['get_page_source'].callback({
      page: 1,
      pageSize: 10000
    });
    const text = result.content[0].text;

    assert.ok(text.includes('[Page 1/12')); // 120000 / 10000 = 12 pages
    assert.ok(text.includes('Characters 1-10000 of 120000'));
  } finally {
    state.drivers.delete(sessionId);
    state.currentSession = null;
  }
});

test('get_console_logs returns first page by default', async () => {
  const sessionId = 'test-logs-1';
  state.drivers.set(sessionId, createMockDriver());
  state.currentSession = sessionId;

  try {
    const result = await server._registeredTools['get_console_logs'].callback({});
    const text = result.content[0].text;

    assert.ok(text.includes('[Page 1/3'));
    assert.ok(text.includes('Log entries 1-100 of 250'));

    // Verify JSON contains 100 entries
    const jsonPart = text.split('\n\n')[1];
    const logs = JSON.parse(jsonPart);
    assert.strictEqual(logs.length, 100);
    assert.strictEqual(logs[0].message, 'Log entry 1');
  } finally {
    state.drivers.delete(sessionId);
    state.currentSession = null;
  }
});

test('get_console_logs returns requested page', async () => {
  const sessionId = 'test-logs-2';
  state.drivers.set(sessionId, createMockDriver());
  state.currentSession = sessionId;

  try {
    const result = await server._registeredTools['get_console_logs'].callback({ page: 2 });
    const text = result.content[0].text;

    assert.ok(text.includes('[Page 2/3'));
    assert.ok(text.includes('Log entries 101-200 of 250'));

    const jsonPart = text.split('\n\n')[1];
    const logs = JSON.parse(jsonPart);
    assert.strictEqual(logs[0].message, 'Log entry 101');
  } finally {
    state.drivers.delete(sessionId);
    state.currentSession = null;
  }
});

test('get_console_logs handles invalid page number', async () => {
  const sessionId = 'test-logs-3';
  state.drivers.set(sessionId, createMockDriver());
  state.currentSession = sessionId;

  try {
    const result = await server._registeredTools['get_console_logs'].callback({ page: 10 });
    const text = result.content[0].text;

    assert.ok(text.includes('Invalid page number'));
    assert.ok(text.includes('Total pages: 3'));
    assert.ok(text.includes('250 log entries'));
  } finally {
    state.drivers.delete(sessionId);
    state.currentSession = null;
  }
});

test('get_console_logs respects custom pageSize', async () => {
  const sessionId = 'test-logs-4';
  state.drivers.set(sessionId, createMockDriver());
  state.currentSession = sessionId;

  try {
    const result = await server._registeredTools['get_console_logs'].callback({
      page: 1,
      pageSize: 50
    });
    const text = result.content[0].text;

    assert.ok(text.includes('[Page 1/5')); // 250 / 50 = 5 pages
    assert.ok(text.includes('Log entries 1-50 of 250'));

    const jsonPart = text.split('\n\n')[1];
    const logs = JSON.parse(jsonPart);
    assert.strictEqual(logs.length, 50);
  } finally {
    state.drivers.delete(sessionId);
    state.currentSession = null;
  }
});

test('get_network_logs returns first page by default', async () => {
  const sessionId = 'test-network-1';
  state.drivers.set(sessionId, createMockDriver());
  state.currentSession = sessionId;

  try {
    const result = await server._registeredTools['get_network_logs'].callback({});
    const text = result.content[0].text;

    assert.ok(text.includes('[Page 1/3'));
    assert.ok(text.includes('Network events 1-100 of 300'));

    // Verify JSON contains 100 entries
    const jsonPart = text.split('\n\n')[1];
    const events = JSON.parse(jsonPart);
    assert.strictEqual(events.length, 100);
    assert.strictEqual(events[0].method, 'Network.requestWillBeSent');
  } finally {
    state.drivers.delete(sessionId);
    state.currentSession = null;
  }
});

test('get_network_logs returns requested page', async () => {
  const sessionId = 'test-network-2';
  state.drivers.set(sessionId, createMockDriver());
  state.currentSession = sessionId;

  try {
    const result = await server._registeredTools['get_network_logs'].callback({ page: 3 });
    const text = result.content[0].text;

    assert.ok(text.includes('[Page 3/3'));
    assert.ok(text.includes('Network events 201-300 of 300'));

    const jsonPart = text.split('\n\n')[1];
    const events = JSON.parse(jsonPart);
    assert.strictEqual(events.length, 100);
  } finally {
    state.drivers.delete(sessionId);
    state.currentSession = null;
  }
});

test('get_network_logs handles invalid page number', async () => {
  const sessionId = 'test-network-3';
  state.drivers.set(sessionId, createMockDriver());
  state.currentSession = sessionId;

  try {
    const result = await server._registeredTools['get_network_logs'].callback({ page: 0 });
    const text = result.content[0].text;

    assert.ok(text.includes('Invalid page number'));
    assert.ok(text.includes('Total pages: 3'));
    assert.ok(text.includes('300 network events'));
  } finally {
    state.drivers.delete(sessionId);
    state.currentSession = null;
  }
});

test('get_network_logs respects custom pageSize', async () => {
  const sessionId = 'test-network-4';
  state.drivers.set(sessionId, createMockDriver());
  state.currentSession = sessionId;

  try {
    const result = await server._registeredTools['get_network_logs'].callback({
      page: 2,
      pageSize: 75
    });
    const text = result.content[0].text;

    assert.ok(text.includes('[Page 2/4')); // 300 / 75 = 4 pages
    assert.ok(text.includes('Network events 76-150 of 300'));

    const jsonPart = text.split('\n\n')[1];
    const events = JSON.parse(jsonPart);
    assert.strictEqual(events.length, 75);
  } finally {
    state.drivers.delete(sessionId);
    state.currentSession = null;
  }
});

test('take_screenshot requires outputPath parameter', async () => {
  const sessionId = 'test-screenshot-1';
  state.drivers.set(sessionId, createMockDriver());
  state.currentSession = sessionId;

  try {
    const tmpPath = '/tmp/test-screenshot.png';
    const result = await server._registeredTools['take_screenshot'].callback({
      outputPath: tmpPath
    });
    const text = result.content[0].text;

    assert.ok(text.includes(`Screenshot saved to ${tmpPath}`));

    // Clean up
    const fs = await import('fs');
    if (fs.existsSync(tmpPath)) {
      fs.unlinkSync(tmpPath);
    }
  } finally {
    state.drivers.delete(sessionId);
    state.currentSession = null;
  }
});

test('take_screenshot tool is registered', () => {
  // Verify the tool is registered and available
  assert.ok(server._registeredTools['take_screenshot']);
  assert.ok(server._registeredTools['take_screenshot'].callback);
});
