var winston = require("winston");

require('winston-daily-rotate-file');

var rotatingFileTransport = new (winston.transports.DailyRotateFile)({
  filename: './logs/server-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});


const myFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss"
  }), winston.format.printf(({ level, message, label, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
  })
);

var options = {
  file: {
    level: "info",
    filename: "./logs/server.log",
    handleExceptions: true,
    json: false,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
  },
  console: {
    level: "debug",
    handleExceptions: true,
    json: false,
    colorize: true
  }
};

// instantiate a new Winston Logger with the settings defined above
var logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    //new winston.transports.File(options.file),
    rotatingFileTransport,
    new winston.transports.Console(options.console)
  ],
  exitOnError: false // do not exit on handled exceptions
});

logger.debug("Logger created!");

module.exports = logger;
