'use strict'
const bcrypt = require('bcryptjs');
const AWS = require('aws-sdk');

AWS.config.update({ region: "us-west-2" });

exports.handler = async (event, context) => {
  const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-west-2" });

  let responseBody = "";
  let statusCode = 0;

  const { email, password } = JSON.parse(event.body);

  const params = {
    TableName: "Users",
    IndexName: "email-index",
    KeyConditionExpression: "#email = :email",
    ExpressionAttributeNames: {
      "#email": "email"
    },
    ExpressionAttributeValues: {
      ":email": email
    },
    ProjectionExpression: "firstname, email, password",
    ScanIndexForward: false
  };

  try {
    const data = await documentClient.query(params).promise();
    const passwordFromDb = data.Items[0].password
    if (bcrypt.compareSync(password, passwordFromDb)) {
      responseBody = JSON.stringify(data.Items[0]);
      statusCode = 201;
    } else {
      statusCode = 500;
      responseBody = `password incorrect`
    }
    console.log(data);
  } catch (err) {
    console.log(err)
    responseBody = `Error: ${err}`
    console.log(err);
    statusCode = 403;
  }

  const response = {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json"
    },
    body: responseBody
  };

  return response;
};