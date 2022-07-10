const axios = require("axios");

const name = `Client`
const email = `testuser+${Math.floor(Math.random() * (100000 - 1)) + 1}@gmail.com`

const generateToken = async () => {
  return axios.post(`${process.env.BASE_URL}/api-clients`, {
    "clientName": name,
    "clientEmail": email
  }, {headers: {
      'Content-Type': 'application/json'
    }})
      .then(r => {
        return r.data
      });
}

module.exports = {
  generateToken
};