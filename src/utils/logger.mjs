import path from 'node:path';
import { createLogger, format, transports } from 'winston';
import { PATHS } from './constant.mjs';

const formats = [
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json(),
  format.printf((info) => `${info.timestamp}[${info.level}]: ${info.message}`),
];

export const logger = createLogger({
  level: 'info',
  format: format.combine(...formats),
  defaultMeta: { service: 'clash-cat' },
  transports: [
    new transports.File({ filename: path.resolve(PATHS.logAbs, 'error.log'), level: 'error' }),
    new transports.File({ filename: path.resolve(PATHS.logAbs, 'warn.log'), level: 'warn' }),
    new transports.File({ filename: path.resolve(PATHS.logAbs, 'combined.log') }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({ format: format.combine(format.colorize(), ...formats) }));
}
