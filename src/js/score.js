const axios = require('axios').default
const { hostUrl } = require('./constants').default

export default {
  async getAllScores() {
    const { data } = await axios.get(`${hostUrl}/scores`)

    return data
  },

  async getHighScore() {
    return axios.get(`${hostUrl}/scores?limit=1`)
  },

  async getTopFive() {
    return axios.get(`${hostUrl}/scores?limit=5`)
  },

  async isTopFive(newScore) {
    const scores = await this.getTopFive()
    const scoresArray = Array.isArray(scores) ? scores : [{ value: 0 }]
    const lowScore = scoresArray.slice(-1)[0].value
    const newScoreInt = parseInt(newScore, 10)
    const lowScoreInt = parseInt(lowScore, 10)

    return newScoreInt > lowScoreInt
  },

  async submitScore(username, value) {
    await axios.post(`${hostUrl}/scores`, { username, value })
  }
}