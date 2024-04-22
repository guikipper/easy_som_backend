const sendSuccessResponse = (res, code, message, data) => {
    return res.status(200).json({
        success: {
          code: code,
          message: message,
          data: data
        },
      });
  }
  
  module.exports = sendSuccessResponse