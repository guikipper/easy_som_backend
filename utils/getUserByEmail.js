const getCollection = require('../db/connect')

const getUserByEmail = async ( email ) => {
        try {
            const collection = await getCollection('Users', 'LearnMusicDatabase');
            const result = await collection.findOne({ email: email });
            return result;
        } catch (error) {
            console.error("Erro ao obter usuários:", error);
            return error;
        }
}

module.exports = getUserByEmail