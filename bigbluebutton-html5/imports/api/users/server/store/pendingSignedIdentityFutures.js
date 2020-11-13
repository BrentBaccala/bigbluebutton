
/* Nothing to see here except a dictionary that maps userIds to lists
 * of futures awaiting responses to GetSignedIdentifyReq messages.
 */

class PendingSignedIdentityFutures {
  constructor() {
    this.store = {};
  }

  add(userId, future) {
    if (!this.store[userId]) this.store[userId] = [];

    this.store[userId].push(future);
  }

  fetch(userId) {
    if (!this.store[userId]) {
      return [];
    }
    return this.store[userId];
  }

  delete(userId) {
    delete this.store[userId];
  }

  fetchAndDelete(userId) {
    const res = this.fetch(userId);
    this.delete(userId);
    return res;
  }
}

export default new PendingSignedIdentityFutures();
