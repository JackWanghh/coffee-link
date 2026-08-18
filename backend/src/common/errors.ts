export type ErrorCode =
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_UNAUTHORIZED'
  | 'AUTH_TOKEN_EXPIRED'
  | 'AUTH_RATE_LIMITED'
  | 'AUTH_CODE_EXPIRED'
  | 'AUTH_CODE_ATTEMPT_LIMIT'
  | 'AUTH_CODE_MISMATCH'
  | 'AUTH_PHONE_TAKEN'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT_SLOT_TAKEN'
  | 'STATE_INVALID'
  | 'QUOTA_EXCEEDED'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_ALREADY_PROCESSED'
  | 'IDEMPOTENCY_REPLAY'
  | 'MEETING_LINK_INVALID'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const notFound = (message = '资源不存在') =>
  new AppError(404, 'NOT_FOUND', message);

export const stateInvalid = (message = '当前状态不能执行该操作') =>
  new AppError(409, 'STATE_INVALID', message);

export const conflictSlotTaken = (message = '该时段已被占用，请选择其他时段') =>
  new AppError(409, 'CONFLICT_SLOT_TAKEN', message);

export const quotaExceeded = (message = '超出额度限制') =>
  new AppError(429, 'QUOTA_EXCEEDED', message);

export const unauthorized = (message = '请先登录') =>
  new AppError(401, 'AUTH_UNAUTHORIZED', message);
