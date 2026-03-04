package org.bigbluebutton.core.apps

import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder

object RemoteDesktopModel {
  def setURL(remoteDesktopModel: RemoteDesktopModel, remoteDesktopUrl: String) {
    remoteDesktopModel.remoteDesktopUrl = remoteDesktopUrl
  }

  def clear(remoteDesktopModel: RemoteDesktopModel) {
    remoteDesktopModel.remoteDesktopUrl = ""
  }

  def stop(outGW: OutMsgRouter, liveMeeting: LiveMeeting) {
    if (!liveMeeting.remoteDesktopModel.remoteDesktopUrl.isEmpty) {
      liveMeeting.remoteDesktopModel.remoteDesktopUrl = ""

      val event = MsgBuilder.buildStopRemoteDesktopEvtMsg(liveMeeting.props.meetingProp.intId)
      outGW.send(event)
    }
  }
}

class RemoteDesktopModel {
  private[apps] var remoteDesktopUrl = ""
}
