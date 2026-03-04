import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput, throwErrorIfNotPresenter} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotPresenter(sessionVariables);
  throwErrorIfInvalidInput(input,
      [
        {name: 'remoteDesktopUrl', type: 'string', required: true},
        {name: 'remoteDesktopPassword', type: 'string', required: false},
        {name: 'remoteDesktopOperators', type: 'string', required: true},
      ]
  )

  const eventName = `StartRemoteDesktopPubMsg`;

  const routing = {
    meetingId: sessionVariables['x-hasura-meetingid'] as String,
    userId: sessionVariables['x-hasura-userid'] as String
  };

  const header = {
    name: eventName,
    meetingId: routing.meetingId,
    userId: routing.userId
  };

  const body = {
    remoteDesktopUrl: input.remoteDesktopUrl,
    remoteDesktopPassword: input.remoteDesktopPassword || '',
    remoteDesktopOperators: input.remoteDesktopOperators,
  };

  return { eventName, routing, header, body };
}
