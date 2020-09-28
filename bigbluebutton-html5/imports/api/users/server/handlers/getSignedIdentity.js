
import PendingSignedIdentityFutures from '../store/pendingSignedIdentityFutures';

export default function handleGetSignedIdentity({ header, body }) {
  const { jwt } = body;

  PendingSignedIdentityFutures.fetchAndDelete(header.userId).forEach(
    future => future.return(jwt),
  );
}
