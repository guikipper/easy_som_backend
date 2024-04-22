const sendErrorResponse = (res, code, message, details) => {
  return res.status(code).json({
    error: {
      code: code,
      message: message,
      details: [details]
    },
  });
}

module.exports = sendErrorResponse