package org.bigbluebutton.core.db

import org.bigbluebutton.core.util.RandomStringGenerator
import slick.jdbc.PostgresProfile.api._
import slick.lifted.ProvenShape

case class RemoteDesktopDbModel(
    remoteDesktopId:        String,
    meetingId:              String,
    remoteDesktopUrl:       String,
    remoteDesktopPassword:  String,
    remoteDesktopOperators: String,
    startedSharingAt:       java.sql.Timestamp,
    stoppedSharingAt:       Option[java.sql.Timestamp],
    updatedAt:              java.sql.Timestamp
)

class RemoteDesktopDbTableDef(tag: Tag) extends Table[RemoteDesktopDbModel](tag, "remoteDesktop") {
  val remoteDesktopId = column[String]("remoteDesktopId", O.PrimaryKey)
  val meetingId = column[String]("meetingId")
  val remoteDesktopUrl = column[String]("remoteDesktopUrl")
  val remoteDesktopPassword = column[String]("remoteDesktopPassword")
  val remoteDesktopOperators = column[String]("remoteDesktopOperators")
  val startedSharingAt = column[java.sql.Timestamp]("startedSharingAt")
  val stoppedSharingAt = column[Option[java.sql.Timestamp]]("stoppedSharingAt")
  val updatedAt = column[java.sql.Timestamp]("updatedAt")
  override def * : ProvenShape[RemoteDesktopDbModel] = (remoteDesktopId, meetingId, remoteDesktopUrl, remoteDesktopPassword, remoteDesktopOperators, startedSharingAt, stoppedSharingAt, updatedAt) <> (RemoteDesktopDbModel.tupled, RemoteDesktopDbModel.unapply)
}

object RemoteDesktopDAO {
  def insert(meetingId: String, url: String, password: String, operators: String): Unit = {
    DatabaseConnection.enqueue(
      TableQuery[RemoteDesktopDbTableDef].forceInsert(
        RemoteDesktopDbModel(
          remoteDesktopId = System.currentTimeMillis() + "-" + RandomStringGenerator.randomAlphanumericString(8),
          meetingId = meetingId,
          remoteDesktopUrl = url,
          remoteDesktopPassword = password,
          remoteDesktopOperators = operators,
          startedSharingAt = new java.sql.Timestamp(System.currentTimeMillis()),
          stoppedSharingAt = None,
          updatedAt = new java.sql.Timestamp(System.currentTimeMillis())
        )
      )
    )
  }

  def updateStoppedSharing(meetingId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[RemoteDesktopDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.stoppedSharingAt.isEmpty)
        .map(rd => rd.stoppedSharingAt)
        .update(Some(new java.sql.Timestamp(System.currentTimeMillis())))
    )
  }
}
