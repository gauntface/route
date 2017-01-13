const chalk = require('chalk');

class LogHelper {
  log(message) {
    console.log(chalk.dim('[Info]: ') + message);
  }

  warn(message) {
    console.warn(chalk.yellow('[Warn]: ') + message);
  }

  error(message, err) {
    console.error(chalk.red('[Error]: ') + message);
    if (err) {
      console.error(chalk.red(err));
    }
  }
}

module.exports = new LogHelper();
