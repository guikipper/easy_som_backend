const getCollection = require('../db/connect');
const { ObjectId } = require('mongodb');

const handleWrongPassword = async (user) => {
    try {
        const collection = await getCollection('BlockedUsers', 'LearnMusicDatabase');

        const filter = { _id: new ObjectId(user._id) };
        const update = {
            $set: {
              _id: user._id,
            },
            $push: { attemptHistory: new Date() }
          };

        const result = await collection.findOneAndUpdate(filter, update, {
            returnDocument: "after",
            upsert: true, // Não criar um novo documento se nenhum for encontrado
          });
        return !!result;
    } catch (error) {
        console.error("Erro ao obter usuário:", error);
        return null;
    }
};

module.exports = handleWrongPassword;


