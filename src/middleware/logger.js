import morgan from 'morgan';
const logger = morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev');

export default logger;
