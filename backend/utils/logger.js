const logger = (message, data = '') => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(message, data);
  }
};

export default logger;