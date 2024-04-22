const getCollection = require('../db/connect');
const sendErrorResponse = require("../utils/sendErrorResponse")

const checkLastEmailSended = async (res, user) => {
    try {
        const collection = await getCollection("Users", "LearnMusicDatabase")
        const result = await collection.findOne({_id: user._id});

        const now = new Date()
        let difference = now - result.lastEmailSended;
        let minutesDifference = difference / (1000 * 60);
        
        if (minutesDifference > 2) {
            return true
        } else {
            return false
        }
    } catch (error) {
        return sendErrorResponse(res, 500, `Ocorreu um erro: ${error}`)
    }
    
  }

module.exports = checkLastEmailSended