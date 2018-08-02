// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
   //Prod configuration
   //production: true,
   //HttpProvider: "",
   // //web3HttpProvider: "https://www.linkgear.net/ligear/gegeChain/",
   //OothAPI: 'https://linkgear.net:8091/auth/',
   //MongoAPI: 'https://linkgear.net:8080/api/',
   //SwarmProvider: 'https://www.linkgear.net/swarm/',
   //************************************************
   //QA configuration
   production: false,
   HttpProvider: "http://localhost:8545",
   // web3HttpProvider: "http://34.238.58.243:8506",
   OothAPI: 'http://23.238.58.243:8091/auth/',
   MongoAPI: 'http://23.238.58.243:8080/api/',
   SwarmProvider: 'http://34.238.58.243:5001/',
   // SwarmProvider: 'http://swarm-gateways.net/',
   //************************************************
   // Common
   inactivitySec: 300,
   pingIntervalSec: 15,
   chainPageImageMaxSize: 2000000,
   chainPageImageMaxCount: 1
};
