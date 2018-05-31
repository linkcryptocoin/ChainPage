// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  HttpProvider: "http://localhost:8545",
  OothAPI: 'http://23.238.58.243:8091/auth/',
  MongoAPI: 'http://23.238.58.243:8080/api/',
  inactivitySec: 300,
  pingIntervalSec: 15
};
