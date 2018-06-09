import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';
// import Web3 from 'web3';
import { environment } from '../../environments/environment';

const Web3 = require('web3');
// const bzz = require("web3-bzz");
declare var window: any;

@Injectable()
export class SwarmService {

    public web3: any;
    // public bzz: any;
    constructor() {
        console.log("in swarm constructor");
        if (typeof this.web3 !== 'undefined') {
            console.log("existing provider at " + this.web3.currentProvider)
            this.web3 = new Web3(this.web3.currentProvider);
          } else {
            // set the provider you want from Web3.providers
            console.log("connection to web3 at " + environment.web3HttpProvider)
            this.web3 = new Web3(new Web3.providers.HttpProvider(environment.web3HttpProvider));
          }
        if (this.web3.isConnected()) {
            console.log(`web3.version: ${this.web3.version.api}`);
            console.log(this.web3);
            // this.web3.bzz.setProvider(environment.SwarmProvider);
            this.web3.bzz.put('f0934b1877f410e103d49256d02cf99227e8e62151b77e31cb82c7474696a8c1', function (err, ret) {
                if (err) {
                    console.log(err);
                }
                console.log(ret)
              })
        }
    }
    uploadFile(file: any): any {
        console.log("in swarm upload")
        // raw data
        this.web3.bzz.upload(file, function(err,res){
            console.log("error:", err);
        })
        // .then(function (hash) {
        //     console.log("Uploaded file. Address:", hash);
        // });
        // upload from disk in node.js
        // this.web3.bzz.upload({
        //     path: filePath,      // path to data / file / directory
        //     kind: "file"           // could also be "directory" or "data"
        //     // defaultFile: "/index.html"   // optional, and only for kind === "directory"
        // })
        //     .then(result => {
        //         console.log;
        //         return result;
        //     })
        //     .catch(err => {
        //         console.log;
        //         return undefined;
        //     });
    }
}