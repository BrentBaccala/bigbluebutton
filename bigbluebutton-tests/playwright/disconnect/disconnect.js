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
      const canvas = await modPage.page.waitForSelector('canvas', {visible:true});
      // there's no sleep statement in the next loop, so it's not sixty seconds
      for (let j = 1; j <= 60; j++) {
	const imagedata = await modPage.page.evaluate((canvas) => {
          const context = canvas.getContext('2d');
          //console.log('canvas', canvas.width, canvas.height);
          // It's a 1900x1200 image, but I know that only because I know that's the default in vnc.conf
          // The 150x50 rectangle at the bottom left of the image contains the word "Applications"
          // for the applications menu in the default freesoft.org GNOME configuration (which differs from the default)
          return Array.from(context.getImageData(0,1150,150,50).data);
	}, canvas);
	//console.log(imagedata);
	//const array = Array.from(imagedata);
	//console.log('array', array);

	// This is how we would save it to a file, it we wanted to.
	// const fs = require('fs');
	// fs.writeFile('bwb.img', Buffer.from(imagedata), (err) => {console.log(err); });
	// then convert it from the command line like this:
	// convert -depth 8 -size 150x50 rgba:bwb.img bwb.png

	const hash = imghash.hashRaw({width: 150, height: 50, data: imagedata}, 8)
	//console.log('hash', imghash.hexToBinary(hash));
	// I've seen both of these two hashs: ff0000fefe400f0f and ff0001fefe400f0f
	// The Levenshtein distance (minimum number of single-character edits - insertions, deletions, or substitutions)
	const distance = await leven("ff0000fefe400f0f", hash);
	//console.log('distance', distance);
	if (distance < 2) break;
	if (j == 60) console.log('Final query to desktop yielded Levenshtein distance', distance);
      }

      /* promise-based approach suggested by gpt4 */
      /* commented out just because we're not split between c200-1/edge and ragazzo anymore */
      /* const { stdout, stderr } = await exec('ssh ragazzo grep MemFree /proc/meminfo'); */
      /* console.log('ragazzo', stdout); */
      // I don't know why this doesn't work
      //const { stdout2, stderr2 } = await exec('grep MemFree /proc/meminfo');
      //console.log('local', stdout2, stderr2);
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
