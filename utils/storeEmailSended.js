const getCollection = require('../db/connect');
const { ObjectId } = require("mongodb");

const storeTokenInfo = async (userId) => {
    const collection = await getCollection("Users", "LearnMusicDatabase")

    const now = new Date();
    const filter = { _id: new ObjectId(userId) };  
    const update = {$set: { lastEmailSended: now }};

    const result = await collection.findOneAndUpdate(filter, update);
   
   return result
  }

module.exports = storeTokenInfo