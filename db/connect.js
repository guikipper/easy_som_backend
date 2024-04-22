const { MongoClient } = require('mongodb')
const password = process.env.MONGO_PASSWORD;

const uri = `mongodb+srv://guikipper1:${password}@learnmusicdatabase.iiz7uzy.mongodb.net/`

const client = new MongoClient(uri)

async function run(col, database) {
    try {
        console.log("Tentando conectar ao banco")
        await client.connect()
        const db = client.db(database)
        const collection = db.collection(col)
        console.log("Conectado!")
        return collection
    } catch (error) {
        console.log('Erro: ',error)
    }
}

module.exports = run
