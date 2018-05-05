import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Globals } from '../globals'
import { Claim } from '../_models/index';
import { Observer } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { AlertService } from '../_services/alert.service';
import { error } from 'util';
const driver = require('bigchaindb-driver');
@Injectable()
export class BigchanDbService {
    //readonly driver = require('bigchaindb-driver');
    // BigchainDB server instance or IPDB (e.g. https://test.bigchaindb.com/api/v1/)
    // readonly API_PATH = 'http://linkcryptocoin.com:8092/api/v1/';
    readonly API_PATH = 'https://test.bigchaindb.com/api/v1/';
    // Create a new keypair.
    readonly chainpage = new driver.Ed25519Keypair();
    //readonly bob = new driver.Ed25519Keypair();
    tx: any;
    txSigned: any;
    conn: any;

    constructor(private http: HttpClient, private alertService: AlertService, private globals: Globals) { }

    createTransaction(asset: any, formName: any) {
        const assetdata = asset;

        // Metadata contains information about the transaction itself
        // (can be `null` if not needed)
        // E.g. the bicycle is fabricated on earth
        // const metadata = { 'formType': this.globals.typeForm }
        const metadata = { 'formType': formName };
        // Construct a transaction payload
        const txCreate = driver.Transaction.makeCreateTransaction(
            assetdata,
            metadata,
            // A transaction needs an output
            [driver.Transaction.makeOutput(
                driver.Transaction.makeEd25519Condition(this.chainpage.publicKey))
            ],
            this.chainpage.publicKey
        )
        // Sign the transaction with private keys of Chainpage to fulfill it
        const txCreateSigned = driver.Transaction.signTransaction(txCreate, this.chainpage.privateKey)

        // Send the transaction off to BigchainDB
        // this.conn = new driver.Connection(this.API_PATH)
        this.conn = new driver.Connection(this.API_PATH, {
            app_id: '118b6d0f',
            app_key: '8974930c6a2033406598b28ba20e5421'
        })
        return this.conn.postTransactionCommit(txCreateSigned)
            // .then(retrievedTx => {
            //     // console.log(retrievedTx);
            //     console.log('Transaction', retrievedTx.id, 'successfully posted.');
            //     //this.alertService.success('Submit successful', true);
            //     // return retrievedTx.id;
            // },
            // error
            // )
            // .then(
            //     (data) => { console.log(data); return data.id; },
            //     (error) => { console.log(" in post()"); return error; }
            // );
        // With the postTransactionCommit if the response is correct, then the transaction
        // is valid and commited to a block

        // Transfer bicycle to Bob
        // .then(() => {
        //   const txTransferBob = driver.Transaction.makeTransferTransaction(
        //     // signedTx to transfer and output index
        //     [{ tx: txCreateAliceSimpleSigned, output_index: 0 }],
        //     [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(this.bob.publicKey))],
        //     // metadata
        //     { price: '100 euro' }
        //   )

        //   // Sign with alice's private key
        //   let txTransferBobSigned = driver.Transaction.signTransaction(txTransferBob, this.alice.privateKey)
        //   console.log('Posting signed transaction: ', txTransferBobSigned)

        //   // Post with commit so transaction is validated and included in a block
        //   return this.conn.postTransactionCommit(txTransferBobSigned)
        // })
        // .then(res => {
        //   console.log('Response from BDB server:', res)
        //   return res.id
        // })
        // .then(tx => {
        //   console.log('Is Bob the owner?', tx['outputs'][0]['public_keys'][0] == this.bob.publicKey)
        //   console.log('Was Alice the previous owner?', tx['inputs'][0]['owners_before'][0] == this.alice.publicKey)
        // })
        // // Search for asset based on the serial number of the bicycle
        // .then(() => this.conn.searchAssets('Bicycle Inc.'))
        // .then(assets => console.log('Found assets with serial number Bicycle Inc.:', assets))

        // this.tx = driver.Transaction.makeCreateTransaction(JSON.stringify(this.model), { FormType: this.model.businessCategory },
        //   [driver.Transaction.makeOutput(
        //     driver.Transaction.makeEd25519Condition(this.alice.publicKey))
        //   ],
        //   this.alice.publicKey);
        // this.txSigned = driver.Transaction.signTransaction(this.tx, this.alice.privateKey);
        // console.log("here1");
        // this.conn = new driver.Connection(this.API_PATH);
        // console.log("here2");
        // this.conn.postTransaction(this.txSigned)
        //   .then(() => this.conn.pollStatusAndFetchTransaction(this.txSigned.id))
        //   .then(retrievedTx => console.log('Transaction', retrievedTx.id, 'successfully posted.'))

    }
    getTransactionsById(id: string) {
        return this.http.get(this.API_PATH + "transactions/" + id);
        // .subscribe(data => {
        //     console.log(data);
        // });
    }
    getAllTransactionsByAsset(search: string) {
        console.log(this.API_PATH + "assets/?search=" + search);;
        return this.http.get(this.API_PATH + "assets/?search=" + search);
        // .subscribe(data => {
        //     console.log(data);
        // });
    }
    getAllTransactionsByMeta(search: string) {
        // console.log(this.API_PATH + "metadata/?search=" + search);
        return this.http.get(this.API_PATH + "metadata/?search=" + search);
        // .subscribe(data => {
        //     console.log(data);
        // });
    }

    // getById(id: number) {
    //     return this.http.get('/api/claim/' + id);
    // }
    // getByCat(cat: number) {
    //     return this.http.get('/api/claims/' + cat);
    // }


    // update(claim: Claim) {
    //     return this.http.put('/api/claims/' + claim.id, claim);
    // }

    // delete(id: number) {
    //     return this.http.delete('/api/claims/' + id);
    // }
}