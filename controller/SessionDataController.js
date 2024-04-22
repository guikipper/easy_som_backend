const getCollection = require("../db/connect");
const filterSummaryData = require("../utils/filterSummaryData");
const updateTrainingSummary = require("../utils/updateTrainingSummary");
const sendErrorResponse = require("../utils/sendErrorResponse")
const sendSuccessResponse = require("../utils/sendSuccessResponse")

class SessionDataController {
    async saveTrainingData(req, res) {
        try {
          console.log("SaveTrainingData")
          const user = req.user;
          const sessionData = req.body.sessionData;
          const rounds = req.body.rounds;
          const collection = await getCollection("Sessions", "LearnMusicDatabase");
          const userId = user._id;
    
          const completeData = {
            userId: userId,
            sessionData,
            rounds,
          };
    
          const result = await collection.insertOne(completeData);
          
          if (result.acknowledged) {
            const filteredData = filterSummaryData(completeData);
            const updateFilterData = await updateTrainingSummary(filteredData);
            console.log(updateFilterData);

            return sendSuccessResponse(res, 200, "Dados atualizados com sucesso!")

          }
        } catch (error) {
          return sendErrorResponse(res, 500, "Erro interno do servidor.", `Erro: ${error}`)
        }
      }
    
      async getTrainingSummary(req, res) {
        try {
          const user = req.user;
          const collection = await getCollection("SummarySessions", "LearnMusicDatabase");
          const result = await collection.findOne({ userId: user._id });
    
        if (result) {
          return sendSuccessResponse(res, 200, "Resumo dos treinamentos.", result)
        } else {
          return sendErrorResponse(res, 404, "Resumo de treinamento não encontrado para o usuário.")
        }
        } catch (error) {
          return sendErrorResponse(res, 500, "Erro interno do servidor.", `Erro: ${error}`)
        }
        
      }
}

module.exports = new SessionDataController()