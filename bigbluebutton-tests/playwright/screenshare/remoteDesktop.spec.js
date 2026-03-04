const { test } = require('../fixtures');
const { RemoteDesktop } = require('./remoteDesktop');
const { linkIssue } = require('../core/helpers');

test.describe.parallel('Remote Desktop', { tag: '@ci' }, () => {
  test.describe.parallel('Basic', () => {
    test('Share remote desktop', async ({ browser, page }) => {
      const remoteDesktop = new RemoteDesktop(browser, page);
      await remoteDesktop.init(true, true);
      await remoteDesktop.shareRemoteDesktop();
    });

    test('Stop remote desktop', async ({ browser, page }) => {
      const remoteDesktop = new RemoteDesktop(browser, page);
      await remoteDesktop.init(true, true);
      await remoteDesktop.stopRemoteDesktop();
    });

    test('Remote desktop default URL pre-filled', async ({ browser, page }) => {
      const remoteDesktop = new RemoteDesktop(browser, page);
      await remoteDesktop.init(true, true);
      await remoteDesktop.remoteDesktopDefaultUrl();
    });
  });

  test.describe.parallel('Exclusivity', () => {
    test('Start screenshare stops remote desktop', { tag: '@flaky' }, async ({ browser, browserName, page }) => {
      test.skip(browserName === 'firefox',
        'Screenshare tests not able in Firefox browser without desktop',
      );
      const remoteDesktop = new RemoteDesktop(browser, page);
      await remoteDesktop.init(true, true);
      await remoteDesktop.screenshareStopsRemoteDesktop();
    });

    test('Start remote desktop stops external video', { tag: '@flaky' }, async ({ browser, page }) => {
      linkIssue(21589);
      const remoteDesktop = new RemoteDesktop(browser, page);
      await remoteDesktop.init(true, true);
      await remoteDesktop.remoteDesktopStopsExternalVideo();
    });

    test('Start external video stops remote desktop', { tag: '@flaky' }, async ({ browser, page }) => {
      linkIssue(21589);
      const remoteDesktop = new RemoteDesktop(browser, page);
      await remoteDesktop.init(true, true);
      await remoteDesktop.externalVideoStopsRemoteDesktop();
    });

    test('Start remote desktop stops screenshare', { tag: '@flaky' }, async ({ browser, browserName, page }) => {
      test.skip(browserName === 'firefox',
        'Screenshare tests not able in Firefox browser without desktop',
      );
      const remoteDesktop = new RemoteDesktop(browser, page);
      await remoteDesktop.init(true, true);
      await remoteDesktop.remoteDesktopStopsScreenshare();
    });
  });

  test.describe.parallel('Regression', () => {
    test('Remote desktop fullscreen button', async ({ browser, page }) => {
      const remoteDesktop = new RemoteDesktop(browser, page);
      await remoteDesktop.init(true, true);
      await remoteDesktop.remoteDesktopFullscreen();
    });

    test('Remote desktop fills presentation area', async ({ browser, page }) => {
      const remoteDesktop = new RemoteDesktop(browser, page);
      await remoteDesktop.init(true, true);
      await remoteDesktop.remoteDesktopFillsPresentation();
    });
  });
});
