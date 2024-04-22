const filterSummaryData = (completeData) => {
    return filteredData = {
      userId: completeData.userId,
      totalTime: completeData.sessionData.timeInMiliseconds,
      rightAnswers: completeData.sessionData.totalRightAnswers,
      totalRounds: completeData.rounds.length
    }
  } 

module.exports = filterSummaryData