/**
 * Auth service event consumer methods
 *
 * @since event-bus-start--JP
 */
import { ServiceSubscription, EventTypesEnum, UserActivationStatusData } from '@bigtix/middleware';
import { EXCHANGE_NAME, consumeIdempotently } from '@bigtix/middleware';
// import { ProcessedEventsRepository } from '../repositories/ProcessedEventsRepository';

// const processedEventRepo = new AbstractProcessedEventRepository();

/**
 * Subscription for auth-srv to consume user events
 */
export const AuthUserEventSubscription : ServiceSubscription = {
  queueName: 'auth-srv.user-events',
  eventConsumers: {
    [EventTypesEnum.USER_DEACTIVATED]: {
      handler: async (envelope) => {
        // await consumeIdempotently(
        //   envelope,
        //   processedEventRepo,  
        //   async () => {
        //     const data = envelope.data as UserActivationStatusData;
        //     console.log('Auth Service received USER_DEACTIVATED event')
        //     await authSvc.onUserDeactivatedEvent(data);
        //   }
        // );
      },
      exchange: EXCHANGE_NAME,
    },
    [EventTypesEnum.USER_REACTIVATED]: {
      handler: async (envelope) => {
        // await consumeIdempotently(
        //   envelope,
        //   processedEventRepo,  
        //   async () => {
        //     const data = envelope.data as UserActivationStatusData;
        //     console.log('Auth Service received USER_REACTIVATED event')
        //     // await authSvc.onUserReactivatedEvent(data);
        //   }
        // );
      },
      exchange: EXCHANGE_NAME,
    },
  },
};
