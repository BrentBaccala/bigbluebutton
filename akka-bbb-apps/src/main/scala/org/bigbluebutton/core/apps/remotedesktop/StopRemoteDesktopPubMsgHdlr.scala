package org.bigbluebutton.core.apps.remotedesktop

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ RemoteDesktopModel, PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.RemoteDesktopDAO
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait StopRemoteDesktopPubMsgHdlr extends RightsManagementTrait {
  this: RemoteDesktopApp2x =>

  def handle(msg: StopRemoteDesktopPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    log.info("Received StopRemoteDesktopPubMsg meetingId={}", liveMeeting.props.meetingProp.intId)

    if (permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "You need to be the presenter to stop remote desktop"
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      RemoteDesktopModel.clear(liveMeeting.remoteDesktopModel)

      RemoteDesktopDAO.updateStoppedSharing(liveMeeting.props.meetingProp.intId)

      //broadcastEvent
      val msgEvent = MsgBuilder.buildStopRemoteDesktopEvtMsg(liveMeeting.props.meetingProp.intId, msg.header.userId)
      bus.outGW.send(msgEvent)
    }
  }
}
