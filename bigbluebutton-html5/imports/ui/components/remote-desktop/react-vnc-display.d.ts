declare module 'react-vnc-display' {
  import React from 'react';

  interface VncDisplayProps {
    url: string;
    width?: string | number;
    height?: string | number;
    background?: string;
    credentials?: { password?: string };
    viewOnly?: boolean;
    shared?: boolean;
    scaleViewport?: boolean;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onSecurityFailure?: () => void;
    onCredentialsRequired?: () => void;
    onClipboard?: (event: any) => void;
    [key: string]: any;
  }

  class VncDisplay extends React.Component<VncDisplayProps> {
    rfb: any;
  }

  export default VncDisplay;
}
