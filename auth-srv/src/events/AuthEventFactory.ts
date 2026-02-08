/**
 * Auth service event builder.
 *
 * @since event-bus-start--JP
 */
import { AbstractEventFactory } from '@bigtix/middleware';
import { EventTypesEnum, SourceServiceEnum } from '@bigtix/middleware';
import { UserIdentityData, UserDeletedData, UserActivationStatusData } from '@bigtix/middleware';

export class AuthEventFactory extends AbstractEventFactory {

  constructor(eventType: EventTypesEnum, correlationId?: string) {
    super(eventType, SourceServiceEnum.AUTH_SRV, correlationId);
  }

  /**
   * @inheritdoc
   */
  createEventData(eventType: EventTypesEnum, data: any): UserIdentityData | UserDeletedData {
    switch (eventType) {
      case EventTypesEnum.USER_CREATED:
      case EventTypesEnum.USER_SIGNED_IN:
      case EventTypesEnum.USER_SIGNED_OUT:
      case EventTypesEnum.USER_UPDATED:
        return { userId: data.userId, email: data.email } as UserIdentityData;
      case EventTypesEnum.USER_DEACTIVATED:
      case EventTypesEnum.USER_REACTIVATED:
        return { userId: data.userId, isActive: data.isActive } as UserActivationStatusData;
      case EventTypesEnum.USER_DELETED:
        return { userId: data.userId } as UserDeletedData;
      default:
        throw new Error(`Event type ${eventType} not supported`);
    }
  }
}
