/**
 * Enum of status codes for API responses
 *
 * @since users-service-continued--JP
 */
export enum STATUS_CODES {
  SUCCESS = 200,
  CREATED = 201,
  NOT_FOUND = 404,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
};
