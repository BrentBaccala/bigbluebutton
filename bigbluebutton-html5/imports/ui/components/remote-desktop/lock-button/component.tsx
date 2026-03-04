import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Button from '/imports/ui/components/common/button/component';

const intlMessages = defineMessages({
  lockDesktop: {
    id: 'app.remoteDesktop.lockDesktop',
    description: 'Lock remote desktop button label',
  },
  unlockDesktop: {
    id: 'app.remoteDesktop.unlockDesktop',
    description: 'Unlock remote desktop button label',
  },
  lockDesktopButtonDesc: {
    id: 'app.remoteDesktop.lockDesktopButtonDesc',
    description: 'Lock remote desktop button description',
  },
});

const LockRemoteDesktopButton: React.FC = () => {
  const intl = useIntl();
  const startLocked = window.meetingClientSettings?.public?.remoteDesktop?.startLocked ?? true;
  const [desktopLocked, setDesktopLocked] = useState(
    (window as any).remoteDesktopViewOnly ?? startLocked,
  );

  const handleOnClick = () => {
    const toggle = (window as any).remoteDesktopToggleViewOnly;
    if (typeof toggle === 'function') {
      toggle();
      setDesktopLocked((prev: boolean) => !prev);
    }
  };

  const label = desktopLocked
    ? intl.formatMessage(intlMessages.unlockDesktop)
    : intl.formatMessage(intlMessages.lockDesktop);

  return (
    <Button
      label={label}
      onClick={handleOnClick}
      hideLabel
      aria-label={intl.formatMessage(intlMessages.lockDesktopButtonDesc)}
      color={!desktopLocked ? 'primary' : 'default'}
      icon={!desktopLocked ? 'desktop' : 'desktop_off'}
      ghost={desktopLocked}
      size="lg"
      circle
    />
  );
};

export default LockRemoteDesktopButton;
