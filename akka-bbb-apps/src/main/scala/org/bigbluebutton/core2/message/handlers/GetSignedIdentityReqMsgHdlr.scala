package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.models.Users2x

import org.bigbluebutton.SystemConfiguration

// The JSON web token code was largely cribbed from here:
//     https://stormpath.com/blog/jwt-java-create-verify
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys

/* GetSignedIdentityReq - called from the Meteor server on behalf of
 * an authenticated user.  Returns an RFC 7519 compliant JSON Web
 * Token (JWT) that identifies the user, is signed with the server's
 * API key, and is intended to be passed to the user's HTML 5 client
 * and relayed from there to a third party, which knows the API key
 * and can use the JWT to verify the authenticated user's identity.
 */

trait GetSignedIdentityReqMsgHdlr extends SystemConfiguration {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleGetSignedIdentityReqMsg(msg: GetSignedIdentityReqMsg) {

    val meetingId = liveMeeting.props.meetingProp.intId
    val userId = msg.header.userId

    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
    val envelope = BbbCoreEnvelope(GetSignedIdentityRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(GetSignedIdentityRespMsg.NAME, meetingId, userId)

    for {
      requester <- Users2x.findWithIntId(liveMeeting.users2x, userId)
    } yield {
      // We will sign our JWT with our API key
      val signingKey = Keys.hmacShaKeyFor(bbbWebSharedSecret.getBytes())

      // Our only JWT claim is the identity of the user
      val builder = Jwts.builder()
        .setSubject(requester.name)
        .signWith(signingKey)

      val compactJws = builder.compact()

      val body = GetSignedIdentityRespMsgBody(compactJws)
      val msg = GetSignedIdentityRespMsg(header, body)

      outGW.send(BbbCommonEnvCoreMsg(envelope, msg))
    }
  }
}
