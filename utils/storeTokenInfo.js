const getCollection = require('../db/connect');

const storeTokenInfo = async (userId, token) => {
    const collection = await getCollection("tokenInfo", "LearnMusicDatabase")

    const doc = {
        userId,
        token,
        used: false,
      }
      const result = await collection.insertOne(doc);
   
   return result
  }

module.exports = storeTokenInfo