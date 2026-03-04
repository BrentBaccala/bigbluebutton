package org.bigbluebutton.common2.msgs

// --- Pub messages (client → backend) ---

object StartRemoteDesktopPubMsg { val NAME = "StartRemoteDesktopPubMsg" }
case class StartRemoteDesktopPubMsg(header: BbbClientMsgHeader, body: StartRemoteDesktopPubMsgBody) extends StandardMsg
case class StartRemoteDesktopPubMsgBody(remoteDesktopUrl: String, remoteDesktopPassword: String, remoteDesktopOperators: String)

object StopRemoteDesktopPubMsg { val NAME = "StopRemoteDesktopPubMsg" }
case class StopRemoteDesktopPubMsg(header: BbbClientMsgHeader, body: StopRemoteDesktopPubMsgBody) extends StandardMsg
case class StopRemoteDesktopPubMsgBody()

// --- Event messages (backend → clients) ---

object StartRemoteDesktopEvtMsg { val NAME = "StartRemoteDesktopEvtMsg" }
case class StartRemoteDesktopEvtMsg(header: BbbClientMsgHeader, body: StartRemoteDesktopEvtMsgBody) extends BbbCoreMsg
case class StartRemoteDesktopEvtMsgBody(remoteDesktopUrl: String)

object StopRemoteDesktopEvtMsg { val NAME = "StopRemoteDesktopEvtMsg" }
case class StopRemoteDesktopEvtMsg(header: BbbClientMsgHeader, body: StopRemoteDesktopEvtMsgBody) extends BbbCoreMsg
case class StopRemoteDesktopEvtMsgBody()
