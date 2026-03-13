type LogLevel = 'info' | 'warn' | 'error';

type LogMeta = Record<string, unknown> | undefined;

function emit(level: LogLevel, message: string, meta?: LogMeta) {
  const prefix = `[luna-mobile][${level}]`;
  if (level === 'error') {
    console.error(prefix, message, meta || '');
    return;
  }
  if (level === 'warn') {
    console.warn(prefix, message, meta || '');
    return;
  }
  console.log(prefix, message, meta || '');
}

export function logInfo(message: string, meta?: LogMeta) {
  emit('info', message, meta);
}

export function logWarn(message: string, meta?: LogMeta) {
  emit('warn', message, meta);
}

export function logError(message: string, meta?: LogMeta) {
  emit('error', message, meta);
}
