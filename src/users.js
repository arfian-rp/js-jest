const axios = require("axios");

class Users {
  static all() {
    return axios.get("users.json").then((r) => r.data);
  }
}

module.exports = Users;
