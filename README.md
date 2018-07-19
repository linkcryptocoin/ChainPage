# LinkGear DApps

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.0.0.

MongoDB is used to store data. You can download it from https://www.mongodb.com/download-center?filter=enterprise?jmp=nav#enterprise

## How to use

run the following commands

1. `git clone https://github.com/linkcryptocoin/ChainPage.git`
2. `cd ChainPage`
3. `npm install`
4. `npm install --save alasql`
5. `npm install --save mongoose`
6. `npm i -g truffle`
7. `truffle compile`
8. `npm i -g @angular/cli`
9. `ng serve`. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Local Test Mode
### Without local mongodb
1. ng serve --port 4200       (terminal 1)
2. node server.js --dbserver 34.238.58.243 --ChainPageUrl http://localhost:4200  (terminal 2)

### With a local mongodb
1. ng serve --port 4200       (terminal 1)
2. node server.js --ChainPageUrl http://localhost:4200  (terminal 2)

## Server mode
1. `ng serve --port 4200 --host 0.0.0.0 --disableHostCheck true`
2. `ng serve --port 8092 --host 0.0.0.0 --disableHostCCheck:true --public http://linkcryptocoin.com:8092`
3. `forever start node_modules/@angular/cli/bin/ng serve --port 4200 --host 0.0.0.0 --disableHostCheck true`
4. `forever start node_modules/@angular/cli/bin/ng serve --port 8092 --host 0.0.0.0 --disableHostCCheck:true --public http://linkcryptocoin.com:8092`

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class/module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Contribute

## Contributors
1. 

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Technologies & Languages Used
1. Angular5 (Typescript/Javascript)
2. Truffle (Solidity)
3. NodeJS
