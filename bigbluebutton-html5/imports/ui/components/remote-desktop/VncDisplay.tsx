import { Component, createElement } from 'react';
import RFB from '@novnc/novnc/core/rfb';

/**
 * Local VNC display component that directly uses noVNC's RFB class.
 * Replaces the react-vnc-display package to avoid double-webpack
 * ES module interop issues with the pre-built UMD bundle.
 */

const events: Record<string, string> = {
  connect: 'onConnect',
  disconnect: 'onDisconnect',
  credentialsrequired: 'onCredentialsRequired',
  securityfailure: 'onSecurityFailure',
  clipboard: 'onClipboard',
  bell: 'onBell',
  desktopname: 'onDesktopName',
  capabilities: 'onCapabilities',
};

const passthroughProperties = [
  'viewOnly',
  'focusOnClick',
  'clipViewport',
  'dragViewport',
  'scaleViewport',
  'resizeSession',
  'showDotCursor',
  'background',
  'qualityLevel',
  'compressionLevel',
];

interface VncDisplayProps {
  url: string;
  style?: React.CSSProperties | null;
  width?: string | number;
  height?: string | number;
  wsProtocols?: string[];
  credentials?: { password?: string };
  shared?: boolean;
  viewOnly?: boolean;
  focusOnClick?: boolean;
  clipViewport?: boolean;
  dragViewport?: boolean;
  scaleViewport?: boolean;
  resizeSession?: boolean;
  showDotCursor?: boolean;
  background?: string;
  qualityLevel?: number;
  compressionLevel?: number;
  onConnect?: (e?: any) => void;
  onDisconnect?: (e?: any) => void;
  onCredentialsRequired?: (e?: any) => void;
  onSecurityFailure?: (e?: any) => void;
  onClipboard?: (e?: any) => void;
  onBell?: (e?: any) => void;
  onDesktopName?: (e?: any) => void;
  onCapabilities?: (e?: any) => void;
  [key: string]: any;
}

export default class VncDisplay extends Component<VncDisplayProps> {
  rfb: any = null;
  canvas: HTMLDivElement | null = null;

  static defaultProps = {
    style: null,
    wsProtocols: ['binary'],
    width: 1280,
    height: 720,
  };

  componentDidMount() {
    this.connect();
  }

  componentWillUnmount() {
    this.disconnect();
  }

  componentDidUpdate(prevProps: VncDisplayProps) {
    if (!this.rfb) return;

    passthroughProperties.forEach((propertyName) => {
      if (
        propertyName in this.props &&
        (this.props as any)[propertyName] != null &&
        (this.props as any)[propertyName] !== (prevProps as any)[propertyName]
      ) {
        this.rfb[propertyName] = (this.props as any)[propertyName];
      }
    });

    if (this.props.scaleViewport || this.props.clipViewport) {
      this.rfb._screen.style.overflow = 'hidden';
    } else {
      this.rfb._screen.style.overflow = 'auto';
    }
  }

  disconnect = () => {
    if (!this.rfb) return;
    this.rfb.disconnect();
    this.rfb = null;
  };

  connect = () => {
    this.disconnect();
    if (!this.canvas) return;

    this.rfb = new RFB(this.canvas, this.props.url, this.props);

    if (this.props.scaleViewport || this.props.clipViewport) {
      this.rfb._screen.style.overflow = 'hidden';
    }

    passthroughProperties.forEach((propertyName) => {
      if (propertyName in this.props && (this.props as any)[propertyName] != null) {
        this.rfb[propertyName] = (this.props as any)[propertyName];
      }
    });

    Object.entries(events).forEach(([event, propertyName]) => {
      if (propertyName in this.props && (this.props as any)[propertyName] != null) {
        this.rfb.addEventListener(event, (this.props as any)[propertyName]);
      }
    });
  };

  registerChild = (ref: HTMLDivElement | null) => {
    this.canvas = ref;
  };

  render() {
    return createElement('div', {
      style: this.props.style || {
        width: this.props.width,
        height: this.props.height,
      },
      ref: this.registerChild,
    });
  }
}
