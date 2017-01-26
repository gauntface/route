const chalk = require('chalk');

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

  log(message, ...args) {
    this._print('log', chalk.dim, '[Info]: ', message, args);
  }

  warn(message, ...args) {
    this._print('warn', chalk.yellow, '[Warn]: ', message, args);
  }

  error(message, ...args) {
    this._print('error', chalk.red, '[Error]: ', message, args);
  }
}

module.exports = new LogHelper();
