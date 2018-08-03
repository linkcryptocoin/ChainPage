import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';
// import Web3 from 'web3';
import { environment } from '../../environments/environment';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
const Web3 = require('web3');
// const bzz = require("web3-bzz");
declare var window: any;

@Injectable()
export class SwarmService {

    public web3: any;

    // public bzz: any;
    constructor(private http: Http, private toasterService: ToasterService, ) {
        // // console.log("in swarm constructor");
        // if (typeof this.web3 !== 'undefined') {
        //     // console.log("existing provider at " + this.web3.currentProvider)
        //     this.web3 = new Web3(this.web3.currentProvider);
        // } else {
        //     // set the provider you want from Web3.providers
        //     // console.log("connection to web3 at " + environment.web3HttpProvider)
        //     this.web3 = new Web3(new Web3.providers.HttpProvider(environment.web3HttpProvider));
        // }
        // if (this.web3.isConnected()) {
        //     // console.log(`web3.version: ${this.web3.version.api}`);
        //     // console.log(this.web3.bzz);
        //     // this.web3.bzz.setProvider(environment.SwarmProvider);
        //     // this.web3.bzz.upload('Hello World', 'plain/text', function (err, ret) {
        //     //     if (err) {
        //     //         console.log(err);
        //     //     }
        //     //     console.log(ret)
        //     //   })
        // }
    }
    getFileUrls(hashes: String[]): String[] {
        let urls = [];
        Array.prototype.forEach.call(hashes, hash => {
            urls.push(environment.SwarmProvider + "bzz:/" + hash + "/");
        });
        // console.log(urls)
        return urls;
    }
    uploadFiles(files: any[]) {
        const formData = new FormData();
        let fileHashes = [];
        // console.log(files);
        let observables: Observable<Response>[] = [];
        for (var i = 0; i < files.length; i++) {
            //if files array contains swarm files, then don't upload
            console.log(JSON.stringify(files[i].file));
            if (JSON.stringify(files[i].file).indexOf("bzz:/") > -1) {
                console.log("NOT uploading ..." + JSON.stringify(files[i].file))
                fileHashes.push(JSON.stringify(files[i].file).split("bzz:/")[1].replace(/"/g, ""));
            }
            else {
                console.log("uploading ..." + files[i].file.name)
                let headers = new Headers({ 'Content-Type': files[i].file.type });
                let options = new RequestOptions(
                    {
                        headers: headers,
                        method: "post",
                        body: files[i].file
                    });
                console.log(files[i].file.type)
                formData.append(files[i].file.name, files[i].file);
                observables.push(this.http.post(environment.SwarmProvider + "bzz:/", formData, options))
            }
        }
        if(observables.length === 0){
            return Observable.of(fileHashes);
        }
        else{
        return Observable.forkJoin(observables)
            .map(resArray => {
                resArray.forEach(res => {
                    fileHashes.push(JSON.parse(JSON.stringify(res))._body);
                });
                return fileHashes;
            });
        }
    }
}