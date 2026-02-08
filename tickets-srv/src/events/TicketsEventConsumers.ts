/**
 * Tickets service event consumer methods
 *
 * @since event-bus-start--JP
 */
import { EventConsumerMap, EventTypesEnum, UserIdentityData, UserActivationStatusData } from '@bigtix/middleware';

/**
 * 'auth-srv.user-events' queue...
 */
export const TicketsUserEventConsumers: Partial<EventConsumerMap> = {
  [EventTypesEnum.USER_CREATED]: async (envelope) => {
    const data = envelope.data as UserIdentityData;
    // handle user created (e.g. sync user into local store if needed)
  },
  [EventTypesEnum.USER_DELETED]: async (envelope) => {
    const data = envelope.data;
    // handle user deleted
  },
  [EventTypesEnum.USER_DEACTIVATED]: async (envelope) => {
    const data = envelope.data as UserActivationStatusData;
    // handle user deactivated
  },
  [EventTypesEnum.USER_REACTIVATED]: async (envelope) => {
    const data = envelope.data as UserActivationStatusData;
    // handle user reactivated
  },
};

/**
 * 'tickets-srv.ticket-events' queue...
 */
// export const TicketsTicketEventConsumers: Partial<EventConsumerMap> = {
// ...
