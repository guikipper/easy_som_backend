const getCollection = require('../db/connect');
const { ObjectId } = require('mongodb');

const checkUserIsBlocked = async (userId) => {
    try {
        const collection = await getCollection('BlockedUsers', 'LearnMusicDatabase');
        const result = await collection.findOne({ _id: new ObjectId(userId) });

        if (!result) {
            return false
        }

        if (result.attemptHistory.length >= 7) {
            const lastSevenAttempts = result.attemptHistory.slice(-7)
            const now = new Date();
            const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
            const recentAttempts = lastSevenAttempts.filter((attempt)=> {
                return attempt > tenMinutesAgo
            })
            if (recentAttempts.length >= 7) {
                await blockUser(userId)
            } 
        }
        return result.blockedUntil;
    } catch (error) {
        console.error("Erro na função checkUserIsBlocked:", error);
        return null;
    }
};


const blockUser = async (userId) => {
    try {
        const collection = await getCollection('BlockedUsers', 'LearnMusicDatabase');
        const now = new Date();
        const tenMinutes = new Date(now.getTime() + 10 * 60 * 1000);
        const filter = { _id: new ObjectId(userId) };
        
        const update = {
            $set: {
              _id: userId,
              "blockedUntil": tenMinutes,
              "blockedOnce": true
            },
          };

        const result = await collection.findOneAndUpdate(filter, update, {
            returnDocument: "after",
            upsert: true, // Não criar um novo documento se nenhum for encontrado
          });

      return result
    } catch (error) {
        onsole.error("Erro na função blockUser:", error);
        return null;
    }
    
}

module.exports = checkUserIsBlocked;