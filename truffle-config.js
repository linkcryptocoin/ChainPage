// Allows us to use ES6 in our migrations and tests.
require('babel-register')

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // match any network
    },
    live: {
      host: "127.0.0.1", // Random IP for example purposes (do not use)
      port: 8088,
      network_id: "*"       // Main network
    },
    sidechain:{
      host: "127.0.0.1",
      port: 8501,
      network_id: "*" // match any network
    }
  }
}
