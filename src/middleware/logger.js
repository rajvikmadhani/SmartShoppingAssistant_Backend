import morgan from 'morgan';

const logger = morgan('dev'); // Use "combined" for production logs

export default logger;
