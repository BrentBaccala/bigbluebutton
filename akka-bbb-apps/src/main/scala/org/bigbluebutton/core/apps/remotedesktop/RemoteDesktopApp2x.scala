package org.bigbluebutton.core.apps.remotedesktop

import org.apache.pekko.actor.ActorContext
import org.apache.pekko.event.Logging

class RemoteDesktopApp2x(implicit val context: ActorContext)
  extends StartRemoteDesktopPubMsgHdlr
  with StopRemoteDesktopPubMsgHdlr {

  val log = Logging(context.system, getClass)
}
