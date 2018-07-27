// Author: Jun Mao
// Date: Jun 16, 2018
// LinkGear Fundation, all  rights reserved
//
// This script Monitor the block chain and super node and 
// send email if chain is stopped or node is offline.
// This script should work together with gegeSchedule.js

"use strict";

const nodemailer = require('nodemailer');

const InactiveABI = [{"constant":true,"inputs":[],"name":"getInactiveList","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_inactiveList","type":"address[]"}],"name":"addInactiveList","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"inactiveNodeList","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"}]

// Contract address on Jun Laptop test
//const InactiveAddress = "0x3fdb929dce44def138aade81e0577ad59a9be5e4"; // Jun Laptop
const InactiveAddress = "0x4d7e130a8bb87506ca33f2c76c28b42e05818b38"; // Production 

// Super Nodes 
var superNodes = []; 

superNodes.push({ name: 'Linkgear AWS Prod', address: '0x195a09b1887a4fd79e44179c0d1fb1cb754a1465', chainStopEmailSent: false ,email: 'maojun9@yahoo.com'});
superNodes.push({ name: 'Linkgear AWS test', address: '0x0d47957299c8ffad58b6e5ea3d3514b8178b0276', chainStopEmailSent: false,email: 'maojun9@yahoo.com' });
superNodes.push({ name: 'Baltimore', address: '0x1d3b2380bc0a8afa19ac451814e7d273bdf5e5da', chainStopEmailSent: false,email: 'cxb99@hotmail.com' });
superNodes.push({ name: 'DC', address: '0xd01caadc22e2fe052b0805d3365c634ed73d1669', chainStopEmailSent: false,email: 'joezhao4865@gmail.com' });


/****** 
superNodes.push({ name: 'Node1', address: '0x4774356406930f5bb1fd9c7b3125aec9ba966350', chainStopEmailSent: false });
superNodes.push({ name: 'Node2', address: '0xe6cee77d9104de4b4321ab488363c1b6875672d9', chainStopEmailSent: false });
superNodes.push({ name: 'Junlaptop', address: '0xa2e2ea845154d36156a8bac2ead6f8a0731f0990', chainStopEmailSent: false });
*****/

var chainStopEmailSent = false;


const Web3 = require('web3');

const web3url = "http://172.31.83.105:8501";
const defaultGas = 8000000;

// 300 seconds
var cIntervalTime = 300000;


function scheduler() {
  console.log('/n');
  console.log('Start scheduler at: '+ new Date());
  CheckChain();
}

function CheckChain() {
  console.log('Chech Block Chain')
 
  if (typeof gegeweb3 !== 'undefined') {
    var gegeweb3 = new Web3(gegeweb3.currentProvider);
  } else {
    // set the provider you want from Web3.providers
    var gegeweb3 = new Web3(new Web3.providers.HttpProvider(web3url));
  }

  // Need set default account, otherwise will get invalid address error
  gegeweb3.eth.defaultAccount=gegeweb3.eth.coinbase;

  var myInactive = gegeweb3.eth.contract(InactiveABI).at(InactiveAddress);

  var inactiveList = myInactive.getInactiveList();

  var currentTIme = Math.round((new Date()).getTime() / 1000);
  var lastBlock  = gegeweb3.eth.blockNumber;
  var lastBlockTime = gegeweb3.eth.getBlock(lastBlock).timestamp

  var needSendEmail = false;
  var cText = '';
  var ccMail = '';
  if ((currentTIme - lastBlockTime)>60) {
    // Last block time is 60 seconds before, the block may stopped
    if (chainStopEmailSent==false) {
      needSendEmail = true;
      chainStopEmailSent = true;
      cText = 'The gegeChain may stopped at block: ' + lastBlock + '\n';
    }
  } else {
    if (chainStopEmailSent==true) {
      chainStopEmailSent = false;
      needSendEmail = true;
      cText = 'The gegeChain back online. \n';

    }
    
    for (var i = 0; i < superNodes.length; i++) { 
      var inactiveNode = false;
      for (var j = 0; j < inactiveList.length; j++) { 
        if (superNodes[i].address ==inactiveList[j]) {
          inactiveNode = true;
          break;
        }
      }

      if (inactiveNode) {
        if (superNodes[i].chainStopEmailSent == false) {
          superNodes[i].chainStopEmailSent = true;
          needSendEmail = true;
          cText = cText + 'Super node ' + superNodes[i].name + ': ' + superNodes[i].address + ' is offline. \n';

          if (superNodes[i].email != '') {
            if (ccMail=='') {
              ccMail = superNodes[i].email;
            } else {
              ccMail = ccMail = ',' + superNodes[i].email;
            }
          }
        }
      } else {
        if (superNodes[i].chainStopEmailSent ==true) {
          superNodes[i].chainStopEmailSent = false;
          needSendEmail = true;
          cText = cText + 'Super node ' + superNodes[i].name + ': ' + superNodes[i].address + ' is online again. \n';
          if (superNodes[i].email != '') {
            if (ccMail=='') {
              ccMail = superNodes[i].email;
            } else {
              ccMail = ccMail = ',' + superNodes[i].email;
            }
          }
        }
      }
    }
    
  }

  if (needSendEmail) {
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'linkgeardev@gmail.com',
        pass: '$jtu3034dev'
      }
    });

    var mailOptions = {
      from: 'linkgeardev@gmail.com',
      to: 'linkgeardev@gmail.com,maojun9@gmail.com',
      cc: ccMail,
      subject: 'gegeChain Problem Alert',
      text: cText
    };

    console.log(cText);

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    }); 
  }
}

setInterval(scheduler,cIntervalTime);