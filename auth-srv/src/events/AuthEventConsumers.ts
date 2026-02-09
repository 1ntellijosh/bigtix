/**
 * Auth service event consumer methods
 *
 * @since event-bus-start--JP
 */
import { EventConsumerMap, EventTypesEnum, UserActivationStatusData } from '@bigtix/middleware';

export const AuthUserEventConsumers: Partial<EventConsumerMap> = {
  [EventTypesEnum.USER_DEACTIVATED]: async (envelope) => {
    const data = envelope.data as UserActivationStatusData;
    // handle user deactivated
  },

  [EventTypesEnum.USER_REACTIVATED]: async (envelope) => {
    const data = envelope.data as UserActivationStatusData;
    // handle user reactivated
  },
};
