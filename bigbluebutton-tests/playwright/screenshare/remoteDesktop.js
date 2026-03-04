const { default: test } = require('@playwright/test');
const Page = require('../core/page');
const { MultiUsers } = require('../user/multiusers');
const { startScreenshare } = require('./util');
const e = require('../core/elements');
const { ELEMENT_WAIT_EXTRA_LONG_TIME } = require('../core/constants');

async function startRemoteDesktop(page) {
  await page.waitAndClick(e.actions);
  await page.waitAndClick(e.shareRemoteDesktopBtn);
  await page.waitForSelector(e.closeModal);
  await page.waitAndClick(e.startShareRemoteDesktopBtn);
  await page.hasElement(e.remoteDesktop, 'should display the remote desktop element', ELEMENT_WAIT_EXTRA_LONG_TIME);
}

async function stopRemoteDesktop(page) {
  await page.waitAndClick(e.actions);
  await page.waitAndClick(e.shareRemoteDesktopBtn);
}

class RemoteDesktop extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async shareRemoteDesktop() {
    await this.waitForSelector(e.whiteboard);
    await startRemoteDesktop(this);
  }

  async stopRemoteDesktop() {
    await this.waitForSelector(e.whiteboard);
    await startRemoteDesktop(this);
    await stopRemoteDesktop(this);
    await this.wasRemoved(e.remoteDesktop, 'should not display the remote desktop after stopping');
    await this.hasElement(e.whiteboard, 'should display the whiteboard after stopping remote desktop');
  }

  async remoteDesktopDefaultUrl() {
    await this.waitForSelector(e.whiteboard);
    await this.waitAndClick(e.actions);
    await this.waitAndClick(e.shareRemoteDesktopBtn);
    await this.waitForSelector(e.closeModal);
    const inputLocator = this.getLocator(e.remoteDesktopModalInput);
    const value = await inputLocator.inputValue();
    await test.expect(value, 'should have the default URL pre-filled').toBeTruthy();
    await this.waitAndClick(e.closeModal);
  }

  async screenshareStopsRemoteDesktop() {
    await this.waitForSelector(e.whiteboard);
    await startRemoteDesktop(this);
    await startScreenshare(this);
    await this.hasElement(e.isSharingScreen, 'should display the screenshare element');
    await this.wasRemoved(e.remoteDesktop, 'should not display the remote desktop after starting screenshare');
    await this.waitAndClick(e.stopScreenSharing);
    await this.hasElement(e.whiteboard, 'should display the whiteboard after stopping screenshare');
  }

  async remoteDesktopStopsExternalVideo() {
    await this.waitForSelector(e.whiteboard);

    // Start external video
    await this.waitAndClick(e.actions);
    await this.waitAndClick(e.shareExternalVideoBtn);
    await this.waitForSelector(e.closeModal);
    await this.type(e.videoModalInput, e.youtubeLink);
    await this.waitAndClick(e.startShareVideoBtn);
    const modFrame = await this.getYoutubeFrame();
    await modFrame.hasElement('video', 'should display the video frame');

    // Start remote desktop — should stop external video
    await startRemoteDesktop(this);
    await this.wasRemoved(e.youtubeFrame, 'should not display the external video after starting remote desktop');
    await this.hasElement(e.remoteDesktop, 'should display the remote desktop element');

    // Clean up
    await stopRemoteDesktop(this);
  }

  async externalVideoStopsRemoteDesktop() {
    await this.waitForSelector(e.whiteboard);
    await startRemoteDesktop(this);

    // Start external video — should stop remote desktop
    await this.waitAndClick(e.actions);
    await this.waitAndClick(e.shareExternalVideoBtn);
    await this.waitForSelector(e.closeModal);
    await this.type(e.videoModalInput, e.youtubeLink);
    await this.waitAndClick(e.startShareVideoBtn);
    const modFrame = await this.getYoutubeFrame();
    await modFrame.hasElement('video', 'should display the video frame');
    await this.wasRemoved(e.remoteDesktop, 'should not display the remote desktop after starting external video');
  }

  async remoteDesktopStopsScreenshare() {
    const { screensharingEnabled } = require('../core/settings').getSettings();

    await this.waitForSelector(e.whiteboard);
    if (!screensharingEnabled) return;

    await startScreenshare(this);
    await this.hasElement(e.isSharingScreen, 'should display the screenshare element');

    // Start remote desktop — should stop screenshare
    await startRemoteDesktop(this);
    await this.wasRemoved(e.isSharingScreen, 'should not display the screenshare after starting remote desktop');
    await this.hasElement(e.remoteDesktop, 'should display the remote desktop element');

    // Clean up
    await stopRemoteDesktop(this);
  }

  async remoteDesktopFullscreen() {
    await this.waitForSelector(e.whiteboard);
    await startRemoteDesktop(this);

    // Get presentation container height before fullscreen
    const presentationLocator = this.getLocator(e.presentationContainer);
    const heightBefore = parseInt(await presentationLocator.evaluate((el) => {
      return getComputedStyle(el).height;
    }));

    // Click the fullscreen button on the remote desktop
    await this.waitAndClick(e.remoteDesktopFullscreenBtn);

    // Verify presentation fullscreen (height should increase)
    const heightAfter = parseInt(await presentationLocator.evaluate((el) => {
      return getComputedStyle(el).height;
    }));
    await test.expect(heightAfter, 'should be in presentation fullscreen mode').toBeGreaterThan(heightBefore);
  }

  async remoteDesktopFillsPresentation() {
    await this.waitForSelector(e.whiteboard);
    await startRemoteDesktop(this);

    // The remote desktop element should be visible
    await this.hasElement(e.remoteDesktop, 'should display the remote desktop element');

    // The whiteboard should not be visible behind the remote desktop
    // (this was the geometry bug — whiteboard was showing behind VNC)
    const remoteDesktopLocator = this.getLocator(e.remoteDesktop);
    const rdBox = await remoteDesktopLocator.boundingBox();
    await test.expect(rdBox, 'should have a bounding box for the remote desktop').toBeTruthy();
    await test.expect(rdBox.width, 'should have non-zero width').toBeGreaterThan(0);
    await test.expect(rdBox.height, 'should have non-zero height').toBeGreaterThan(0);
  }
}

class MultiUserRemoteDesktop extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }
}

exports.RemoteDesktop = RemoteDesktop;
exports.MultiUserRemoteDesktop = MultiUserRemoteDesktop;
exports.startRemoteDesktop = startRemoteDesktop;
exports.stopRemoteDesktop = stopRemoteDesktop;
