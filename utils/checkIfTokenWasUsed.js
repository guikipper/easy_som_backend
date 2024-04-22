const getCollection = require('../db/connect');

const checkIfTokenWasUsed = async (token) => {
    const collection = await getCollection("tokenInfo", "LearnMusicDatabase")

    const filter = { token };    
    const update = {$set: { used: true }};

    const result = await collection.findOneAndUpdate(filter, update);

    if (!result.value) {
      console.log("Nao encontrou nada")
    }
   return result
  }

module.exports = checkIfTokenWasUsed