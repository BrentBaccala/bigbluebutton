package org.bigbluebutton.core.apps.remotedesktop

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ ExternalVideoModel, RemoteDesktopModel, PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.screenshare.ScreenshareApp2x.requestBroadcastStop
import org.bigbluebutton.core.db.RemoteDesktopDAO
import org.bigbluebutton.core.apps.pads.PadsApp2x.setPinned

trait StartRemoteDesktopPubMsgHdlr extends RightsManagementTrait {
  this: RemoteDesktopApp2x =>

  def handle(msg: StartRemoteDesktopPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    log.info("Received StartRemoteDesktopPubMsg meetingId={} url={}", liveMeeting.props.meetingProp.intId, msg.body.remoteDesktopUrl)

    def broadcastEvent(msg: StartRemoteDesktopPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, "nodeJSapp")
      val envelope = BbbCoreEnvelope(StartRemoteDesktopEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(StartRemoteDesktopEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = StartRemoteDesktopEvtMsgBody(msg.body.remoteDesktopUrl)
      val event = StartRemoteDesktopEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (liveMeeting.props.meetingProp.disabledFeatures.contains("remoteDesktop")) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "Remote Desktop is disabled for this meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else if (permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "You need to be the presenter to start remote desktop"
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      // Stop screenshare
      requestBroadcastStop(bus.outGW, liveMeeting)

      // Unpin shared notes
      setPinned(bus.outGW, liveMeeting, "notes", pinned = false)

      // Stop any active external video
      ExternalVideoModel.stop(bus.outGW, liveMeeting)

      // Update in-memory model
      RemoteDesktopModel.setURL(liveMeeting.remoteDesktopModel, msg.body.remoteDesktopUrl)

      // Insert into database
      RemoteDesktopDAO.insert(
        liveMeeting.props.meetingProp.intId,
        msg.body.remoteDesktopUrl,
        msg.body.remoteDesktopPassword,
        msg.body.remoteDesktopOperators
      )

      broadcastEvent(msg)
    }
  }
}
