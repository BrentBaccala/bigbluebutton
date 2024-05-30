// -*- js-indent-level: 2 -*-

const { expect } = require('@playwright/test');
const Page = require('../core/page');
const e = require('../core/elements');
const c = require('../core/constants');
const parameters = require('../core/parameters');
const { checkIsPresenter } = require('../user/util');
const { createMeeting } = require('../core/helpers');
const imghash = require('imghash');
//const { exec } = require('child_process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { env } = require('node:process');

// This doesn't work: const leven = require('leven');
// The solution is from https://stackoverflow.com/a/75281896/1493790
const leven = (...args) => import('leven').then(({default: leven}) => leven(...args));

class Disconnect {
  constructor(browser, context, page) {
    this.modPage = new Page(browser, page);
    this.browser = browser;
    this.context = context;
    this.userPages = [];
  }

  async getNewPageTab() {
    return this.browser.newPage();
  }

  async moderatorAsPresenter() {
    const maxFailRate = c.JOIN_AS_MODERATOR_TEST_ROUNDS * c.MAX_JOIN_AS_MODERATOR_FAIL_RATE;
    let failureCount = 0;
    for (let i = 1; i <= c.JOIN_AS_MODERATOR_TEST_ROUNDS; i++) {
      await this.modPage.init(true, true, { fullName: `Moderator-${i}` });
      await this.modPage.waitForSelector(e.userAvatar);
      const isPresenter = await checkIsPresenter(this.modPage);
      await this.modPage.waitAndClick(e.actions);
      const canStartPoll = await this.modPage.checkElement(e.polling);
      if (!isPresenter || !canStartPoll) {
        failureCount++;
      }

      const newPage = await this.context.newPage();
      await this.modPage.page.close();
      this.modPage.page = newPage;
      console.log(`Loop ${i} of ${c.JOIN_AS_MODERATOR_TEST_ROUNDS} completed`);
      await expect(failureCount).toBeLessThanOrEqual(maxFailRate);
    }
  }

  async breakoutRoomInvitation() {
    await this.modPage.init(true, true, { fullName: 'Moderator' });
    for (let i = 1; i <= c.BREAKOUT_ROOM_INVITATION_TEST_ROUNDS; i++) {
      const userName = `User-${i}`;
      const newPage = await this.getNewPageTab();
      const userPage = new Page(this.browser, newPage);
      await userPage.init(false, true, { fullName: userName, meetingId: this.modPage.meetingId });
      console.log(`${userName} joined`);
      this.userPages.push(userPage);
    }

    // Create breakout rooms with the allow choice option enabled
    await this.modPage.bringToFront();
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.waitAndClick(e.allowChoiceRoom);
    await this.modPage.waitAndClick(e.modalConfirmButton);

    for (const page of this.userPages) {
      await page.bringToFront();
      await page.hasElement(e.modalConfirmButton, c.ELEMENT_WAIT_LONGER_TIME);
      await page.hasElement(e.labelGeneratingURL, c.ELEMENT_WAIT_LONGER_TIME);
    }

    // End breakout rooms
    await this.modPage.bringToFront();
    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.waitAndClick(e.endBreakoutRoomsButton);
    await this.modPage.closeAudioModal();

    // Create breakout rooms with the allow choice option NOT enabled (randomly assign)
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.waitAndClick(e.randomlyAssign);
    await this.modPage.waitAndClick(e.modalConfirmButton);

    for (const page of this.userPages) {
      await page.bringToFront();
      await page.hasElement(e.modalConfirmButton);
    }
  }

  async twoUsersJoinSameTime() {
    for (let i = 1; i <= c.JOIN_TWO_USERS_ROUNDS; i++) {
      console.log(`loop ${i} of ${c.JOIN_TWO_USERS_ROUNDS}`);
      const meetingId = await createMeeting(parameters);
      const modPage = new Page(this.browser, await this.getNewPageTab());
      const userPage = new Page(this.browser, await this.getNewPageTab());
      await Promise.all([
        modPage.init(true, false, { meetingId }),
        userPage.init(false, false, { meetingId }),
      ]);
      await modPage.waitForSelector(e.audioModal);
      await userPage.waitForSelector(e.audioModal);
      await modPage.page.close();
      await userPage.page.close();
    }
  }

  async usersJoinKeepingConnected(rounds = c.JOIN_TWO_USERS_KEEPING_CONNECTED_ROUNDS,
				  withAudio = false, keepPagesOpen = false, withConsole = false) {
    const meetingId = await createMeeting(parameters);
    const pages = [];

    for (let i = 1; i <= rounds / 2; i++) {
      console.log(`joining ${i * 2} users of ${rounds}`);
      const modPage = new Page(this.browser, await this.getNewPageTab());
      const userPage = new Page(this.browser, await this.getNewPageTab());
      pages.push(modPage);
      pages.push(userPage);
      if (withConsole) {
	modPage.page.on('console', (...msg) => console.log(`Mod-${i}`, ...msg));
	userPage.page.on('console', (...msg) => console.log(`User-${i}`, ...msg));
      }
      await Promise.all([
        modPage.init(true, !withAudio, { meetingId, fullName: `Mod-${i}` }),
        userPage.init(false, !withAudio, { meetingId, fullName: `User-${i}` }),
      ]);
      if (withAudio) {
        await modPage.waitForSelector(e.audioModal, c.ELEMENT_WAIT_LONGER_TIME);
        await userPage.waitForSelector(e.audioModal, c.ELEMENT_WAIT_LONGER_TIME);
	await modPage.waitAndClick(e.microphoneButton);
	await userPage.waitAndClick(e.microphoneButton);
        await modPage.waitAndClick(e.echoYesButton, modPage.settings.listenOnlyCallTimeout);
        await userPage.waitAndClick(e.echoYesButton, userPage.settings.listenOnlyCallTimeout);
      }
    }

    if (! keepPagesOpen) {
      pages.forEach(async (currentPage) => {
        await currentPage.page.close();
      })
    }
  }

  async usersJoinWithRemoteDesktop(rounds = c.JOIN_TWO_USERS_KEEPING_CONNECTED_ROUNDS,
				  withAudio = false, keepPagesOpen = false, withConsole = false) {
    const meetingId = await createMeeting(parameters);
    const pages = [];

    const start_mod = Number(env?.START) || 1;

    for (let i = start_mod; i <= rounds; i++) {
      console.log(`joining user ${i} of ${rounds}`);
      const modPage = new Page(this.browser, await this.getNewPageTab());
      const modName = "Student-" + i.toString().padStart(2,'0')
      //const modName = "CloudMyLab";
      //const modName = "Student-50";
      //const modName = "baccala";
      pages.push(modPage);
      if (withConsole) {
	modPage.page.on('console', (...msg) => console.log(modName, ...msg));
      }
      await Promise.all([
	// the first arg true makes it a moderator
        modPage.init(true, !withAudio, { meetingId, fullName: modName }),
      ]);
      if (withAudio) {
        await modPage.waitForSelector(e.audioModal, c.ELEMENT_WAIT_LONGER_TIME);
	await modPage.waitAndClick(e.microphoneButton);
        await modPage.waitAndClick(e.echoYesButton, modPage.settings.listenOnlyCallTimeout);
      }
      if (i == start_mod) {
        await modPage.waitAndClick(e.actions);
        await modPage.waitAndClick('li[data-test="shareRemoteDesktop"]');
        // add a data-test tag to this button
        await modPage.waitAndClick('button[aria-label="Share a remote desktop"]');
      }
      await modPage.page.waitForSelector('canvas', {visible:true});
    }

    if (! keepPagesOpen) {
      pages.forEach(async (currentPage) => {
        await currentPage.page.close();
      })
    }
  }

  async usersJoinExceddingParticipantsLimit() {
    for (let i = 1; i <= c.JOIN_TWO_USERS_EXCEEDING_MAX_PARTICIPANTS; i++) {
      console.log(`loop ${i} of ${c.JOIN_TWO_USERS_EXCEEDING_MAX_PARTICIPANTS}`);

      const pages = [];
      const meetingId = await createMeeting(parameters, `maxParticipants=${c.MAX_PARTICIPANTS_TO_JOIN}`);

      for (let j = 1; j <= c.MAX_PARTICIPANTS_TO_JOIN + 1; j++) {
        pages.push(new Page(this.browser, await this.getNewPageTab()));
      }

      for (let j = 1; j < c.MAX_PARTICIPANTS_TO_JOIN; j++) {
        console.log(`- joining user ${j} of ${c.MAX_PARTICIPANTS_TO_JOIN}`);
        await pages[j - 1].init(true, false, { meetingId, fullName: `User-${j}` });
      }
      console.log('- joining two users at the same time');

      const lastPages = [
        pages[pages.length - 1],
        pages[pages.length - 2],
      ]

      Promise.all(lastPages.map((page, index) => {
        return page.init(true, false, { meetingId, fullName: `User-last-${index}` })
      }));

      try {
        await lastPages[0].waitForSelector(e.audioModal);
        await lastPages[1].waitForSelector(e.errorScreenMessage);
      } catch (err) {
        await lastPages[1].waitForSelector(e.audioModal);
        await lastPages[0].waitForSelector(e.errorScreenMessage);
      }

      pages.forEach(async (currentPage) => {
        await currentPage.page.close();
      })
    }
  }
}

exports.Disconnect = Disconnect;
