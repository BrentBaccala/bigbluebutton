import { Meteor } from 'meteor/meteor';
import validateAuthToken from './methods/validateAuthToken';
import setEmojiStatus from './methods/setEmojiStatus';
import assignPresenter from './methods/assignPresenter';
import changeRole from './methods/changeRole';
import removeUser from './methods/removeUser';
import toggleUserLock from './methods/toggleUserLock';
import setUserEffectiveConnectionType from './methods/setUserEffectiveConnectionType';
import userActivitySign from './methods/userActivitySign';
import userLeftMeeting from './methods/userLeftMeeting';
import getSignedIdentity from './methods/getSignedIdentity';
import setRandomUser from './methods/setRandomUser';

Meteor.methods({
  setEmojiStatus,
  assignPresenter,
  changeRole,
  removeUser,
  validateAuthToken,
  toggleUserLock,
  setUserEffectiveConnectionType,
  userActivitySign,
  userLeftMeeting,
  getSignedIdentity,
  setRandomUser,
});
