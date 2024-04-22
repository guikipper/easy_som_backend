const getCollection = require('../db/connect');
const { ObjectId } = require('mongodb');

const getUser = async (userId) => {
    try {
        const collection = await getCollection('Users', 'LearnMusicDatabase');
        const result = await collection.findOne({ _id: new ObjectId(userId) });
        return result;
    } catch (error) {
        console.error("Erro ao obter usuário:", error);
        return null;
    }
};

module.exports = getUser;