"use strict";

const express = require("express");
const pg = require("pg");
const sls = require("serverless-http");

const databaseUser = process.env.DB_USER;
const databasePassword = process.env.DB_PASSWORD;
const databaseName = process.env.DB_NAME;
const databaseHost = process.env.DB_HOST;
const databasePort = process.env.DB_PORT;
const databaseMaxCon = process.env.DB_MAX_CONNECTIONS;
const databaseIdleTimeout = process.env.DB_IDLE_TIMEOUT;
const databaseConnectionTimeout = process.env.DB_CONNECTION_TIMEOUT;

let dbConfig = {
  user: databaseUser,
  password: databasePassword,
  database: databaseName,
  host: databaseHost,
  port: databasePort,
  max: databaseMaxCon,
  idleTimeoutMillis: databaseIdleTimeout,
  connectionTimeoutMillis: databaseConnectionTimeout
};

const app = express();

app.get("/first_user", async (req, res, next) => {
  let pool = new pg.Pool(dbConfig);
  pool.connect(function(err, client, done) {
    if (err) {
      let errorMessage = "Error connecting to pg server";

      res.status(500).send(errorMessage);
    } else {
      //Write a simple query to verify the connection.
      var a = client.query(
        "SELECT * FROM e_users ORDER BY id LIMIT 1",
        (err, result) => {
          if (err) {
            res.status(500).send(err);
          } else {
            let user_data = result["rows"][0];

            res.status(200).send(
              JSON.stringify({
                user: user_data
              })
            );
          }

          //Make sure to release the client and end the postgres pool after the work is done.
          client.release();
          pool.end();
        }
      );
    }
  });
});
module.exports.postgres = sls(app);
