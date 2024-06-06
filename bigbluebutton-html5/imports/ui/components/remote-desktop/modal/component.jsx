import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Auth from '/imports/ui/services/auth';

import { defineMessages, injectIntl } from 'react-intl';
import { isUrlValid } from '../service';

import Styled from './styles';

const propTypes = {
  remoteDesktopUrl: PropTypes.string,
  startWatching: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

const defaultProps = {
  remoteDesktopUrl: Meteor.settings.public?.remoteDesktop?.defaultUrl,
}

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
    description: 'Remote desktop URL',
  },
  password: {
    id: 'app.remoteDesktop.password',
    description: 'Remote desktop password',
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
});

class RemoteDesktopModal extends Component {
  constructor(props) {
    super(props);

    const { remoteDesktopUrl } = props;

    this.state = {
      url: remoteDesktopUrl,
      sharing: remoteDesktopUrl,
      password: null,
      operators: 'all',
    };

    this.startWatchingHandler = this.startWatchingHandler.bind(this);
    this.updateRemoteDesktopUrlHandler = this.updateRemoteDesktopUrlHandler.bind(this);
    this.renderUrlError = this.renderUrlError.bind(this);
    this.updateRemoteDesktopUrlHandler = this.updateRemoteDesktopUrlHandler.bind(this);
  }

  startWatchingHandler() {
    const {
      startWatching,
      setIsOpen,
    } = this.props;

    const { url, password, operators } = this.state;

    startWatching(url.trim(), password, operators === 'I' ? Auth.userID : operators);
    setIsOpen(false);
  }

  updateRemoteDesktopUrlHandler(ev) {
    this.setState({ url: ev.target.value ? ev.target.value : Meteor.settings.public?.remoteDesktop?.defaultUrl });
  }

  updateRemoteDesktopPassword(ev) {
    this.setState({ password: ev.target.value });
  }

  updateRemoteDesktopOperators(ev) {
    this.setState({ operators: ev.target.value });
  }

  renderUrlError() {
    const { intl } = this.props;
    const { url } = this.state;

    const valid = (!url || url.length <= 3) || isUrlValid(url);

    return (
      !valid
        ? (
          <Styled.UrlError>
            {intl.formatMessage(intlMessages.urlError)}
          </Styled.UrlError>
        )
        : null
    );
  }

  render() {
    const { intl, setIsOpen, isOpen, onRequestClose, priority, } = this.props;
    const { url, sharing } = this.state;

    const startDisabled = !isUrlValid(url);

    return (
      <Styled.RemoteDesktopModal
/*        overlayClassName={styles.overlay} */
        onRequestClose={() => setIsOpen(false)}
        contentLabel={intl.formatMessage(intlMessages.title)}
/*        hideBorder */
        {...{
          setIsOpen,
          isOpen,
          onRequestClose,
          priority,
        }}
      >
        <Styled.RemoteDesktopHeader data-test="remoteDesktopModalHeader">
          <Styled.Title>{intl.formatMessage(intlMessages.title)}</Styled.Title>
        </Styled.RemoteDesktopHeader>

        <Styled.RemoteDesktopContent>
          <Styled.RemoteDesktopUrl>
            <label htmlFor="remote-desktop-modal-input" id="remote-desktop-modal-input">
              {intl.formatMessage(intlMessages.input)}
              <input
                id="remote-desktop-modal-input"
                onChange={this.updateRemoteDesktopUrlHandler}
                name="remote-desktop-modal-input"
                placeholder={Meteor.settings.public?.remoteDesktop?.defaultUrl ? Meteor.settings.public?.remoteDesktop?.defaultUrl : intl.formatMessage(intlMessages.urlInput)}
                disabled={sharing}
                aria-describedby="remote-desktop-note"
              />
            </label>
          </Styled.RemoteDesktopUrl>

          <Styled.RemoteDesktopUrl>
            <label htmlFor="remote-desktop-modal-password" id="remote-desktop-modal-password">
              {intl.formatMessage(intlMessages.password)}
              <input
                id="remote-desktop-modal-password"
                onChange={this.updateRemoteDesktopPassword}
                name="remote-desktop-modal-password"
                type="password"
                required={false}
              />
            </label>
          </Styled.RemoteDesktopUrl>

          <Styled.RemoteDesktopUrl>
            <label htmlFor="remote-desktop-modal-operators" id="remote-desktop-modal-operators">
              <select
                id="remote-desktop-modal-operators"
                name="remote-desktop-modal-operators"
                onChange={this.updateRemoteDesktopOperators}
                value={this.state.operators}
              >
                <option value="all">All users can operate desktop</option>
                <option value="moderators">Only moderators can operate desktop</option>
                <option value="presenter">Only the presenter can operate desktop</option>
                <option value="I">Only I can operate desktop</option>
              </select>
            </label>
          </Styled.RemoteDesktopUrl>

          <div>
            {this.renderUrlError()}
          </div>

          <Styled.StartButton
            label={intl.formatMessage(intlMessages.start)}
            onClick={this.startWatchingHandler}
            disabled={startDisabled}
            data-test="shareRemoteDesktop"
            color="primary"
          />
        </Styled.RemoteDesktopContent>
      </Styled.RemoteDesktopModal>
    );
  }
}

RemoteDesktopModal.propTypes = propTypes;
RemoteDesktopModal.defaultProps = defaultProps;

export default injectIntl(RemoteDesktopModal);
