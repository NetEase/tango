export const logger = {
  group(title: string, body: string) {
    console.groupCollapsed(title);
    console.log(body);
    console.groupEnd();
  },

  log(msg: string) {
    console.log('[Log]: %s', msg);
  },

  warn(msg: string) {
    warning(false, msg);
  },

  error(...args: any) {
    console.error('[Error]: ', ...args);
  },
};

/**
 * 如果条件为 false 则打印警告日志
 * @example warning(truthyValue, 'This should not log a warning');
 * @example warning(falsyValue, 'This should log a warning');
 * @see https://github.com/alexreardon/tiny-warning
 *
 * @param condition 打印警告日志的条件
 * @param message 警告日志
 */
export function warning(condition: boolean, message: string) {
  if (condition) {
    return;
  }

  console.warn(`Warning: ${message}`);
}

/**
 * 如果条件为 false 则抛出错误
 * @see https://github.com/alexreardon/tiny-invariant
 * @param condition 条件
 * @param message 错误消息
 */
export function invariant(condition: boolean, message: string | (() => string)) {
  if (condition) {
    return;
  }

  const text = typeof message === 'function' ? message() : message;
  throw new Error(`Invariant failed: ${text}`);
}
