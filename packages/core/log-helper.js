const chalk = require('chalk');
const moment = require('moment');

require('console-group').install();

/* eslint-disable no-console */

class LogHelper {
  _print(logMethod, colorFn, tag, msg, args) {
    console[logMethod](colorFn(tag) + msg);
    if (args && args.length > 0) {
      console.group(colorFn('Arguments'));
      args.forEach((arg) => {
        console[logMethod](arg);
        if (arg.stack) {
          console[logMethod](arg.stack);
        }
      });
      console.groupEnd();
    }
  }

  getTimestamp() {
    return moment().format(`DD/MM HH:mm:SS`);
  }

  log(message, ...args) {
    this._print('log', chalk.dim, `[Info  ${this.getTimestamp()}]: `,
      message, args);
  }

  warn(message, ...args) {
    this._print('warn', chalk.yellow, `[Warn  ${this.getTimestamp()}]: `,
      message, args);
  }

  error(message, ...args) {
    this._print('error', chalk.red, `[Error  ${this.getTimestamp()}]: `,
      message, args);
  }
}

module.exports = new LogHelper();
