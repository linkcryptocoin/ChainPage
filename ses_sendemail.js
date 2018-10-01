// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-1'});

// Load creddentials from profile ~/.aws/credentials
var credentials = new AWS.SharedIniFileCredentials();
AWS.config.credentials = credentials;

// Create sendEmail params 
var params = {
  Destination: { /* required */
    ToAddresses: [
      'maojun9@yahoo.com'
    ]
  },
  Message: { /* required */
    Body: { /* required */
      Html: {
       Charset: "UTF-8",
       Data: "HTML_FORMAT_BODY"
      },
      Text: {
       Charset: "UTF-8",
       Data: "TEXT_FORMAT_BODY"
      }
     },
     Subject: {
      Charset: 'UTF-8',
      Data: 'Test email'
     }
    },
  Source: 'support@linkgear.io', /* required */
  ReplyToAddresses: [
  ],
};       

// Create the promise and SES service object
var sendPromise = new AWS.SES({apiVersion: '2012-10-17'}).sendEmail(params).promise();

// Handle promise's fulfilled/rejected states
sendPromise.then(
  function(data) {
    console.log(data.MessageId);
  }).catch(
    function(err) {
    console.error(err, err.stack);
  });