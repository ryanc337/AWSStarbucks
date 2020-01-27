'use strict'
const bcrypt = require('bcryptjs');
const AWS = require('aws-sdk');

AWS.config.update({ region: "us-west-2" });

exports.handler = async (event, context) => {
  const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-west-2" });

  let responseBody = "";
  let statusCode = 0;

  const { first_name, last_name, email, password, id } = JSON.parse(event.body);
  
  const hashPassword = (password) => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash
  };
  
  const hashedPassword = await hashPassword(password);

  const params = {
    TableName: "Users",
    Item: {
      id: id,
      firstname: first_name,
      lastname: last_name,
      email: email,
      password: hashedPassword
    }
  }

  try {
    const data = await documentClient.put(params).promise();
    responseBody = JSON.stringify(data);
    statusCode = 201;
    console.log(data);
  } catch (err) {
    responseBody = `Error: ${err}`;
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
}