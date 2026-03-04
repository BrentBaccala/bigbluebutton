import React, { useEffect, useRef, useCallback, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import VncDisplay from './VncDisplay';
import Auth from '/imports/ui/services/auth';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import {
  layoutDispatch,
  layoutSelect,
  layoutSelectInput,
  layoutSelectOutput,
} from '../layout/context';
import {
  ExternalVideo,
  Input,
  Layout,
  Output,
} from '../layout/layoutTypes';
import { ACTIONS, PRESENTATION_AREA } from '../layout/enums';
import { Container, VncWrapper } from './styles';
import { canOperate } from './service';
import FullscreenButtonContainer from '/imports/ui/components/common/fullscreen-button/container';
import { uniqueId } from '/imports/utils/string-utils';

const intlMessages = defineMessages({
  remoteDesktopLabel: {
    id: 'app.remoteDesktop.remoteDesktopLabel',
    description: 'remote desktop element label',
  },
});

interface RemoteDesktopProps {
  remoteDesktopUrl: string;
  remoteDesktopPassword: string;
  userCanOperate: boolean;
  isPresenter: boolean;
  isResizing: boolean;
  fullscreenContext: boolean;
  fullscreenElementId: string;
  startLocked: boolean;
  externalVideo: ExternalVideo;
}

const RemoteDesktop: React.FC<RemoteDesktopProps> = ({
  remoteDesktopUrl,
  remoteDesktopPassword,
  userCanOperate,
  isPresenter,
  isResizing,
  fullscreenContext,
  fullscreenElementId,
  startLocked,
  externalVideo,
}) => {
  const intl = useIntl();
  const playerParentRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewOnly, setViewOnly] = useState(startLocked);

  const {
    height,
    width,
    top,
    left,
    right,
  } = externalVideo;

  // Build URL with session token
  const urlWithToken = React.useMemo(() => {
    if (!remoteDesktopUrl) return '';
    const separator = remoteDesktopUrl.includes('?') ? '&' : '?';
    return `${remoteDesktopUrl}${separator}sessionToken=${Auth.sessionToken}`;
  }, [remoteDesktopUrl]);

  // Clipboard sync
  const clipboardTextRef = useRef('');

  const transferClipboardText = useCallback(() => {
    if (typeof navigator.clipboard?.readText === 'function') {
      navigator.clipboard.readText().then((text) => {
        if (text !== clipboardTextRef.current) {
          if (playerRef.current?.rfb) {
            playerRef.current.rfb.clipboardPasteFrom(text);
          }
          clipboardTextRef.current = text;
        }
      }).catch(() => {
        // Clipboard read failed (permission denied, etc.)
      });
    }
  }, []);

  useEffect(() => {
    document.addEventListener('cut', transferClipboardText);
    document.addEventListener('copy', transferClipboardText);
    return () => {
      document.removeEventListener('copy', transferClipboardText);
      document.removeEventListener('cut', transferClipboardText);
    };
  }, [transferClipboardText]);

  // Fullscreen handling
  const onFullscreenChange = useCallback(() => {
    const el = playerParentRef.current;
    if (!el) return;
    const newIsFullscreen = !!(
      document.fullscreenElement === el
    );
    setIsFullscreen(newIsFullscreen);
    if (playerRef.current?.rfb?._handleResize) {
      playerRef.current.rfb._handleResize();
    }
  }, []);

  useEffect(() => {
    const el = playerParentRef.current;
    if (!el) return () => {};
    el.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      el.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, [onFullscreenChange]);

  // Expose toggle callback for the lock button
  // Use a window property so the lock button can access it
  useEffect(() => {
    (window as any).remoteDesktopToggleViewOnly = () => {
      setViewOnly((prev) => !prev);
    };
    (window as any).remoteDesktopViewOnly = viewOnly;
    return () => {
      delete (window as any).remoteDesktopToggleViewOnly;
      delete (window as any).remoteDesktopViewOnly;
    };
  }, [viewOnly]);

  const handleResize = useCallback(() => {
    if (playerRef.current?.rfb?._handleResize) {
      playerRef.current.rfb._handleResize();
    }
  }, []);

  const isMinimized = width === 0 && height === 0;

  const ALLOW_FULLSCREEN = window.meetingClientSettings?.public?.app?.allowFullscreen ?? true;

  return (
    <Container
      style={{
        height,
        width,
        top,
        left,
        right,
        zIndex: Math.max(externalVideo.zIndex ?? 1, 3),
      }}
      isResizing={isResizing}
      isMinimized={isMinimized}
    >
      <VncWrapper
        fullscreen={fullscreenContext}
        ref={playerParentRef}
        data-test="remoteDesktop"
        onFocus={() => transferClipboardText()}
      >
        {ALLOW_FULLSCREEN && (
          <FullscreenButtonContainer
            key={uniqueId('fullscreenButton-')}
            elementName={intl.formatMessage(intlMessages.remoteDesktopLabel)}
            fullscreenRef={playerParentRef.current}
            elementId={fullscreenElementId}
            isFullscreen={fullscreenContext}
            dark
          />
        )}
        <VncDisplay
          width="100%"
          height="100%"
          background="transparent"
          url={urlWithToken}
          credentials={{ password: remoteDesktopPassword || '' }}
          onConnect={handleResize}
          onClipboard={(event: any) => {
            if (typeof navigator.clipboard?.writeText === 'function') {
              navigator.clipboard.writeText(event.detail.text).catch(() => {});
            }
          }}
          viewOnly={!userCanOperate || viewOnly}
          shared
          scaleViewport
          ref={playerRef}
        />
      </VncWrapper>
    </Container>
  );
};

const RemoteDesktopContainer: React.FC = () => {
  const { data: currentUser } = useCurrentUser((user) => ({
    presenter: user.presenter,
    isModerator: user.isModerator,
    userId: user.userId,
  }));

  const { data: currentMeeting } = useMeeting((m) => ({
    remoteDesktop: m.remoteDesktop,
    layout: m.layout,
  }));

  const hasRemoteDesktop = useRef(false);

  const fullscreenElementId = 'RemoteDesktop';
  // Remote desktop reuses the external video layout output
  const externalVideo: ExternalVideo = layoutSelectOutput((i: Output) => i.externalVideo);
  const hasExternalVideoOnLayout: boolean = layoutSelectInput((i: Input) => i.externalVideo?.hasExternalVideo);
  const cameraDock = layoutSelectInput((i: Input) => i.cameraDock);
  const { isResizing } = cameraDock;
  const layoutContextDispatch = layoutDispatch();
  const fullscreen = layoutSelect((i: Layout) => i.fullscreen);
  const { element } = fullscreen;
  const fullscreenContext = (element === fullscreenElementId);

  const remoteDesktopUrl = currentMeeting?.remoteDesktop?.remoteDesktopUrl;

  useEffect(() => {
    if (!remoteDesktopUrl && hasRemoteDesktop.current) {
      layoutContextDispatch({
        type: ACTIONS.SET_PILE_CONTENT_FOR_PRESENTATION_AREA,
        value: {
          content: PRESENTATION_AREA.REMOTE_DESKTOP,
          open: false,
        },
      });
      hasRemoteDesktop.current = false;
    } else if (remoteDesktopUrl && !hasRemoteDesktop.current) {
      layoutContextDispatch({
        type: ACTIONS.SET_PILE_CONTENT_FOR_PRESENTATION_AREA,
        value: {
          content: PRESENTATION_AREA.REMOTE_DESKTOP,
          open: true,
        },
      });
      hasRemoteDesktop.current = true;
    }
  }, [remoteDesktopUrl]);

  if (!currentUser || !currentMeeting?.remoteDesktop || !externalVideo?.display) return null;
  if (!hasExternalVideoOnLayout) return null;

  const isPresenter = currentUser.presenter ?? false;
  const startLocked = window.meetingClientSettings?.public?.remoteDesktop?.startLocked ?? true;

  const userCanOperate = canOperate(
    currentMeeting.remoteDesktop.remoteDesktopOperators || 'all',
    {
      presenter: isPresenter,
      isModerator: currentUser.isModerator ?? false,
      userId: currentUser.userId ?? '',
    },
  );

  return (
    <RemoteDesktop
      remoteDesktopUrl={currentMeeting.remoteDesktop.remoteDesktopUrl}
      remoteDesktopPassword={currentMeeting.remoteDesktop.remoteDesktopPassword || ''}
      userCanOperate={userCanOperate}
      isPresenter={isPresenter}
      isResizing={isResizing}
      fullscreenContext={fullscreenContext}
      fullscreenElementId={fullscreenElementId}
      startLocked={startLocked}
      externalVideo={externalVideo}
    />
  );
};

export default RemoteDesktopContainer;
