/**
 * Auth service event consumer methods
 *
 * @since event-bus-start--JP
 */
import { EventConsumerMap, EventTypesEnum, UserActivationStatusData } from '@bigtix/middleware';
import { EXCHANGE_NAME } from '@bigtix/middleware';

export const AuthUserEventConsumers: Partial<EventConsumerMap> = {
  [EventTypesEnum.USER_DEACTIVATED]: {
    handler: async (envelope) => {
      const data = envelope.data as UserActivationStatusData;
      // handle user deactivated
    },
    exchange: EXCHANGE_NAME,
  },

  [EventTypesEnum.USER_REACTIVATED]: {
    handler: async (envelope) => {
      const data = envelope.data as UserActivationStatusData;
      // handle user reactivated
    },
    exchange: EXCHANGE_NAME,
  },
};
