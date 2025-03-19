const sendError = (res, statusCode, message) => {
  res.status(statusCode).json({
    success: false,
    message: message,
  });
};

export default sendError;
