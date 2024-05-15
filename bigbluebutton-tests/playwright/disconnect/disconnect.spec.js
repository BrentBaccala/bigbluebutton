// -*- js-indent-level: 2 -*-

const { test } = require('@playwright/test');
const { Disconnect } = require('./disconnect.js');
const { env } = require('node:process');

if (env?.KEEP_OPEN)
  test.only('Join users (mod and attendee) keeping the test open', async ({ browser, context, page }) => {
    const disconnect = new Disconnect(browser, context, page);
    await disconnect.usersJoinKeepingConnected(env.KEEP_OPEN, false, true, true);
    await page.pause();
  });

if (env?.REMOTE_DESKTOP)
  test.only('Join users with remote desktop', async ({ browser, context, page }) => {
    const disconnect = new Disconnect(browser, context, page);
    // args are: number of clients (env.REMOTE_DESKTOP), withAudio, keepPagesOpen, withConsole
    await disconnect.usersJoinWithRemoteDesktop(env.REMOTE_DESKTOP, false, true, false);
    await page.pause();
  });
