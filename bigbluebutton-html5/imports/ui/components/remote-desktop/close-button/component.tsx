import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Button from '/imports/ui/components/common/button/component';

const intlMessages = defineMessages({
  closeRemoteDesktopLabel: {
    id: 'app.remoteDesktop.hide',
    description: 'Hide remote desktop label',
  },
});

interface CloseDesktopProps {
  onClick: () => void;
}

const CloseDesktopComponent: React.FC<CloseDesktopProps> = ({ onClick }) => {
  const intl = useIntl();

  return (
    <Button
      role="button"
      aria-labelledby="closeLabel"
      aria-describedby="closeDesc"
      icon="minus"
      size="sm"
      onClick={onClick}
      label={intl.formatMessage(intlMessages.closeRemoteDesktopLabel)}
      hideLabel
    />
  );
};

export default CloseDesktopComponent;
