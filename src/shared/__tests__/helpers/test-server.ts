import { app } from '../../../index';

let testServer: ReturnType<typeof app.listen> | null = null;
const TEST_PORT = 8001;

/**
 * Start test server
 */
export async function startTestServer(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (testServer) {
      resolve(`http://localhost:${TEST_PORT}`);
      return;
    }

    testServer = app.listen(TEST_PORT, () => {
      console.log(`Test server listening on port ${TEST_PORT}`);
      resolve(`http://localhost:${TEST_PORT}`);
    });

    testServer.on('error', reject);
  });
}

/**
 * Stop test server
 */
export async function stopTestServer(): Promise<void> {
  return new Promise((resolve) => {
    if (testServer) {
      testServer.close(() => {
        testServer = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
}

/**
 * Get test server base URL
 */
export function getTestServerUrl(): string {
  return `http://localhost:${TEST_PORT}`;
}
