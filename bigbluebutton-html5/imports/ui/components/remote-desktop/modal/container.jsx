import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import RemoteDesktopModal from './component';
import { startWatching, getRemoteDesktopUrl } from '../service';

const RemoteDesktopModalContainer = props => <RemoteDesktopModal {...props} />;

export default withTracker(({ }) => ({
  startWatching,
  remoteDesktopUrl: getRemoteDesktopUrl(),
}))(RemoteDesktopModalContainer);
