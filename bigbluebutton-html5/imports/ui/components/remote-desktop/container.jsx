import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import { getRemoteDesktopUrl, getRemoteDesktopPassword, getRemoteDesktopCanOperate } from './service';
import RemoteDesktop from './component';
import getFromUserSettings from '/imports/ui/services/users-settings';
import {
  layoutSelect,
  layoutSelectInput,
  layoutSelectOutput,
  layoutDispatch,
} from '../layout/context';

const RemoteDesktopContainer = props => {
  const layoutContextDispatch = layoutDispatch();
  const fullscreenElementId = 'RemoteDesktop';
  const fullscreen = layoutSelect((i) => i.fullscreen);
  const { element } = fullscreen;
  const fullscreenContext = (element === fullscreenElementId);
  return (
    <RemoteDesktop {...{ ...props, layoutContextDispatch, fullscreenContext, }} />
  );
};

const LAYOUT_CONFIG = Meteor.settings.public.layout;

export default withTracker(({ isPresenter }) => {
  const inEchoTest = Session.get('inEchoTest');
  return {
    inEchoTest,
    isPresenter,
    remoteDesktopUrl: getRemoteDesktopUrl(),
    remoteDesktopPassword: getRemoteDesktopPassword(),
    remoteDesktopCanOperate: getRemoteDesktopCanOperate(),
    hidePresentation: getFromUserSettings('bbb_hide_presentation', LAYOUT_CONFIG.hidePresentation),
  };
})(RemoteDesktopContainer);
