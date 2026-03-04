import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import Styled from './styles';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import { isUrlValid } from '../service';
import { REMOTE_DESKTOP_START } from '../mutations';
import Auth from '/imports/ui/services/auth';

const intlMessages = defineMessages({
  start: {
    id: 'app.remoteDesktop.start',
    description: 'Share remote desktop',
  },
  urlError: {
    id: 'app.remoteDesktop.urlError',
    description: 'Not a remote desktop URL error',
  },
  input: {
    id: 'app.remoteDesktop.input',
    description: 'Remote Desktop URL',
  },
  password: {
    id: 'app.remoteDesktop.password',
    description: 'Remote Desktop Password',
  },
  urlInput: {
    id: 'app.remoteDesktop.urlInput',
    description: 'URL input field placeholder',
  },
  title: {
    id: 'app.remoteDesktop.title',
    description: 'Modal title',
  },
  close: {
    id: 'app.remoteDesktop.close',
    description: 'Close',
  },
  note: {
    id: 'app.remoteDesktop.noteLabel',
    description: 'provides hint about shared remote desktops',
  },
  operatorsAll: {
    id: 'app.remoteDesktop.operators.all',
    description: 'All users operator option',
  },
  operatorsModerators: {
    id: 'app.remoteDesktop.operators.moderators',
    description: 'Only moderators operator option',
  },
  operatorsPresenter: {
    id: 'app.remoteDesktop.operators.presenter',
    description: 'Only presenter operator option',
  },
  operatorsMe: {
    id: 'app.remoteDesktop.operators.me',
    description: 'Only me operator option',
  },
});

interface RemoteDesktopModalProps {
  onRequestClose: () => void;
  priority: string;
  setIsOpen: (isOpen: boolean) => void;
  isOpen: boolean;
}

const RemoteDesktopModal: React.FC<RemoteDesktopModalProps> = ({
  isOpen,
  setIsOpen,
  onRequestClose,
  priority,
}) => {
  const intl = useIntl();
  const Settings = getSettingsSingletonInstance();
  // @ts-ignore - settings is a js singleton
  const { animations } = Settings.application;
  const defaultUrl = (window as any).meetingClientSettings?.public?.remoteDesktop?.defaultUrl || '';
  const [url, setUrl] = React.useState(defaultUrl);
  const [password, setPassword] = React.useState('');
  const [operators, setOperators] = React.useState('all');
  const [startRemoteDesktop] = useMutation(REMOTE_DESKTOP_START);

  const valid = isUrlValid(url);

  const handleStart = () => {
    const remoteDesktopOperators = operators === 'me' ? Auth.userID : operators;
    startRemoteDesktop({
      variables: {
        remoteDesktopUrl: url.trim(),
        remoteDesktopPassword: password,
        remoteDesktopOperators,
      },
    });
    onRequestClose();
  };

  return (
    <Styled.RemoteDesktopModal
      onRequestClose={onRequestClose}
      contentLabel={intl.formatMessage(intlMessages.title)}
      title={intl.formatMessage(intlMessages.title)}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      priority={priority}
    >
      <Styled.Content>
        <Styled.InputField animations={animations}>
          <label htmlFor="remote-desktop-modal-input">
            {intl.formatMessage(intlMessages.input)}
            <input
              id="remote-desktop-modal-input"
              onChange={(e) => setUrl(e.target.value)}
              value={url}
              name="remote-desktop-modal-input"
              placeholder={intl.formatMessage(intlMessages.urlInput)}
              aria-describedby="remote-desktop-note"
              onPaste={(e) => { e.stopPropagation(); }}
              onCut={(e) => { e.stopPropagation(); }}
              onCopy={(e) => { e.stopPropagation(); }}
            />
          </label>
        </Styled.InputField>

        <Styled.InputField animations={animations}>
          <label htmlFor="remote-desktop-modal-password">
            {intl.formatMessage(intlMessages.password)}
            <input
              id="remote-desktop-modal-password"
              onChange={(e) => setPassword(e.target.value)}
              name="remote-desktop-modal-password"
              type="password"
            />
          </label>
        </Styled.InputField>

        <Styled.InputField animations={animations}>
          <label htmlFor="remote-desktop-modal-operators">
            Operators
            <select
              id="remote-desktop-modal-operators"
              name="remote-desktop-modal-operators"
              onChange={(e) => setOperators(e.target.value)}
              value={operators}
            >
              <option value="all">{intl.formatMessage(intlMessages.operatorsAll)}</option>
              <option value="moderators">{intl.formatMessage(intlMessages.operatorsModerators)}</option>
              <option value="presenter">{intl.formatMessage(intlMessages.operatorsPresenter)}</option>
              <option value="me">{intl.formatMessage(intlMessages.operatorsMe)}</option>
            </select>
          </label>
        </Styled.InputField>

        <Styled.NoteText id="remote-desktop-note">
          {intl.formatMessage(intlMessages.note)}
        </Styled.NoteText>

        <div>
          {!valid && url ? (
            <Styled.UrlError animations={animations}>
              {intl.formatMessage(intlMessages.urlError)}
            </Styled.UrlError>
          ) : null}
        </div>

        <Styled.StartButton
          label={intl.formatMessage(intlMessages.start)}
          disabled={!valid || !url}
          onClick={handleStart}
          data-test="shareRemoteDesktop"
          color="primary"
        />
      </Styled.Content>
    </Styled.RemoteDesktopModal>
  );
};

export default RemoteDesktopModal;
