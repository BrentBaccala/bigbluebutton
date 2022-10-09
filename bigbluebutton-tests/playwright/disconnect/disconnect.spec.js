const { test } = require('@playwright/test');
const { Disconnect } = require('./disconnect.js');
const { env } = require('node:process');

if (env?.KEEP_OPEN)
  test.only('Join users (mod and attendee) keeping the test open', async ({ browser, context, page }) => {
    const disconnect = new Disconnect(browser, context, page);
    await disconnect.usersJoinKeepingConnected(env.KEEP_OPEN, false, true, true);
    await page.pause();
  });
