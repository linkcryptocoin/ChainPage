import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';
import Web3 from 'web3';
import { environment } from '../../environments/environment';

//const Web3 = require('web3');

declare var window: any;

@Injectable()
export class SwarmService {

    public web3: any;
    public bzz: any;
    constructor() {
        console.log("in swarm constructor")
        if (typeof window.web3 !== 'undefined') {
            console.warn(
                'Using web3 detected from external source. If you find that your accounts don\'t appear or you have 0 MetaCoin, ensure you\'ve configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask'
            );
            // Use Mist/MetaMask's provider
            this.web3 = new Web3(window.web3.currentProvider);
        } else {
            console.warn(
                'No web3 detected. Falling back to ${environment.web3HttpProvider}. You should remove this fallback when you deploy live, as it\'s inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
            );
            // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
            this.web3 = new Web3(
                new Web3.providers.HttpProvider(environment.SwarmProvider)
            );
        }
        if (this.web3.isConnected()) {
            console.log(`web3.version used by gegeChain: ${this.web3.version.api}`);
            // this.web3.bzz.setProvider(environment.SwarmProvider);
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