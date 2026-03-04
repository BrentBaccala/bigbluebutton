import { gql } from '@apollo/client';

export const REMOTE_DESKTOP_START = gql`
  mutation RemoteDesktopStart(
    $remoteDesktopUrl: String!
    $remoteDesktopPassword: String
    $remoteDesktopOperators: String!
  ) {
    remoteDesktopStart(
      remoteDesktopUrl: $remoteDesktopUrl
      remoteDesktopPassword: $remoteDesktopPassword
      remoteDesktopOperators: $remoteDesktopOperators
    )
  }
`;

export const REMOTE_DESKTOP_STOP = gql`
  mutation RemoteDesktopStop {
    remoteDesktopStop
  }
`;
