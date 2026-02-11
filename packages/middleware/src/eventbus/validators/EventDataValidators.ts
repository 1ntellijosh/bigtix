/**
 * Runtime validators for event data. Use these to validate envelope.data against EventDataContracts
 * before handling (interfaces are type-only and not available at runtime).
 *
 * @since event-bus-start--JP
 */
import { EventTypesEnum } from '../enums/EventsEnums';
import { ValidationHelpers as val } from './ValidationHelpers';
import type {
  UserIdentityData,
  UserDeletedData,
  UserActivationStatusData,
  TicketCreatedData,
  TicketUpdatedData,
  TicketDeletedData,
  OrderCreatedData,
  OrderStatusUpdatedData,
} from '../contracts/EventDataContracts';
import { OrderStatusEnum } from '@bigtix/common';

export function validateUserIdentityData(data: unknown): data is UserIdentityData {
  return val.isObject(data) && val.hasString(data, 'userId') && val.hasEmail(data, 'email');
}

export function validateUserDeletedData(data: unknown): data is UserDeletedData {
  return val.isObject(data) && val.hasString(data, 'userId');
}

export function validateUserActivationStatusData(data: unknown): data is UserActivationStatusData {
  return val.isObject(data) && val.hasString(data, 'userId') && val.hasBoolean(data, 'isActive');
}

export function validateTicketCreatedData(data: unknown): data is TicketCreatedData {
  if (!val.isObject(data)) return false;
  return (
    val.hasString(data, 'ticketId') &&
    val.hasString(data, 'eventId') &&
    val.hasString(data, 'userId') &&
    val.hasNumber(data, 'price') &&
    val.hasString(data, 'description') &&
    val.hasString(data, 'serialNumber') &&
    val.hasString(data, 'title') &&
    val.hasNumber(data, 'version')
  );
}

export function validateTicketUpdatedData(data: unknown): data is TicketUpdatedData {
  if (!val.isObject(data)) return false;
  return (
    val.hasString(data, 'ticketId') &&
    val.hasNumber(data, 'price') &&
    val.hasString(data, 'description') &&
    val.hasString(data, 'title') &&
    val.hasNumber(data, 'version')
  );
}

export function validateTicketDeletedData(data: unknown): data is TicketDeletedData {
  return val.isObject(data) && val.hasString(data, 'ticketId');
}

export function validateOrderCreatedData(data: unknown): data is OrderCreatedData {
  return (
    val.isObject(data) && 
    val.hasString(data, 'orderId') && 
    val.hasString(data, 'userId') && 
    val.hasArray(data, 'tickets') && 
    val.hasNumber(data, 'expiresAt') && 
    val.hasString(data, 'status') && 
    val.hasNumber(data, 'version')
  );
}

export function validateOrderStatusUpdatedData(data: unknown): data is OrderStatusUpdatedData {
  return (
    val.isObject(data) &&
    val.hasString(data, 'orderId') &&
    val.hasEnum(data, 'status', OrderStatusEnum) &&
    val.hasNumber(data, 'version')
  );
}

export type EventDataValidator = (data: unknown) => boolean;

/**
 * Map event type → validator so incoming envelope.data can be validated before dispatch.
 */
export const EventDataValidators: Partial<Record<EventTypesEnum, EventDataValidator>> = {
  [EventTypesEnum.USER_CREATED]: validateUserIdentityData,
  [EventTypesEnum.USER_SIGNED_IN]: validateUserIdentityData,
  [EventTypesEnum.USER_SIGNED_OUT]: validateUserIdentityData,
  [EventTypesEnum.USER_UPDATED]: validateUserIdentityData,
  [EventTypesEnum.USER_DELETED]: validateUserDeletedData,
  [EventTypesEnum.USER_DEACTIVATED]: validateUserActivationStatusData,
  [EventTypesEnum.USER_REACTIVATED]: validateUserActivationStatusData,
  [EventTypesEnum.TICKET_CREATED]: validateTicketCreatedData,
  [EventTypesEnum.TICKET_UPDATED]: validateTicketUpdatedData,
  [EventTypesEnum.TICKET_DELETED]: validateTicketDeletedData,
  [EventTypesEnum.TICKET_SOLD]: validateTicketDeletedData,
  [EventTypesEnum.TICKET_CANCELLED]: validateTicketDeletedData,
  [EventTypesEnum.TICKET_REFUNDED]: validateTicketDeletedData,
};
