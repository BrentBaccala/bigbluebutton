import { Meteor } from 'meteor/meteor';
import Future from 'fibers/future';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';
import PendingSignedIdentityFutures from '../store/pendingSignedIdentityFutures';

/* Meteor server method for getting signed RFC 7519 JSON Web Tokens that
 * can authenticate a BBB user to a third party.
 *
 * The HTML 5 client calls makeCall('getSignedIdentity').
 *
 * This method runs on the Meteor server and just relays the request
 * over Redis to akka-bbb-apps, where the JWTs are generated.
 */

export default function getSignedIdentity() {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'GetSignedIdentityReqMsg';

  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  if (requesterUserId) {
    /* Unblock this fiber so that messages continue to be processed for this client
     * while we're waiting for akka-bbb-apps to respond to our request for a JWT.
     *
     * You can see the effect of this call by commenting it out and
     * inserting a ten second delay into handleGetSignedIdentityReqMsg
     * (in akka-bbb-apps), then sharing and immediately unsharing a
     * remote desktop.  The unshare uses Meteor messages and they will
     * not be processed until this function is unblocked.
     */
    this.unblock();

    const future = new Future();

    PendingSignedIdentityFutures.add(requesterUserId, future);

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, null);

    return future.wait();
  }
}
