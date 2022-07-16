import transports, { Transport, TransportConfig } from './transports';
import { isAllowed, Level } from './levels';
import { getLocation } from './location';
import { createTemplate, format } from './format';

interface Config {
  transports?: Transport[];
  level?: Level;
}

const defaultConfig: Config = {
  transports: [new transports.console({ level: 'info' })],
  level: 'info',
};

const createLogger = (unsafeConfig?: Config) => {
  const config = { ...defaultConfig, ...unsafeConfig };

  const log = (level: Level) => {
    // @ts-ignore
    if (!isAllowed(config.level, level)) {
      return (strings: TemplateStringsArray, ...expressions: any): void => {};
    }

    return (strings: TemplateStringsArray, ...expressions: any[]): void => {
      // @ts-ignore
      return config.transports.forEach((transport) => {
        if (!transport.isAllowed(level)) {
          return null;
        }

        const content = strings.reduce((prev, curr, index) => {
          const formatted = transport.format(expressions[index] || '');

          return `${prev}${curr}${formatted}`;
        }, '');

        const message = transport.getMessage({
          level,
          message: content,
          date: new Date(),
          location: getLocation(4),
        });

        return transport.log({ level, message });
      });
    };
  };

  return {
    log,
    emerg: log('emerg'),
    alert: log('alert'),
    crit: log('crit'),
    error: log('error'),
    warning: log('warning'),
    notice: log('notice'),
    info: log('info'),
    debug: log('debug'),
  };
};

export { createLogger, transports, createTemplate, format, Transport, TransportConfig };
