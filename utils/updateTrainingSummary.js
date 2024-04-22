const getCollection = require('../db/connect');

const updateTrainingSummary = async (filteredSummaryData) => {
    const collection = await getCollection("SummarySessions", "LearnMusicDatabase")
    const result = await collection.updateOne(
      { "userId": filteredSummaryData.userId },
      { $inc: 
        { totalTime: filteredSummaryData.totalTime,
          rightAnswers: filteredSummaryData.rightAnswers,
          totalRounds: filteredSummaryData.totalRounds
        } 
      },
      { upsert: true }
   )
   return result
  }

module.exports = updateTrainingSummary