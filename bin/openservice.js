#!/usr/bin/env node

require("dotenv").config();
const args = require("minimist")(process.argv.slice(2));
const lodash = require("lodash");
const App = require("../libs/app");
const Path = require("path");
const openEnv = require("openenv");

const paths = args._ || [];
// reference for env regex filtering
// const isLower = '^[a-z0-9]'

let config = lodash.reduce(
  paths,
  (result, fn) => {
    const path = Path.resolve(process.cwd(), fn);
    return lodash.merge(result, require(path));
  },
  {}
);

const env = openEnv(process.env, { regex: process.env.envRegex });

config = lodash.merge(config, env);

App(config)
  .then(() => {
    console.log(config.name, "Online");
  })
  .catch((e) => {
    console.log("Error Loading", config.name, e);
    process.exit(1);
  });

process.on("unhandledRejection", function (err, promise) {
  console.log(err, promise);
  process.exit(1);
});

process.on("uncaughtException", function (err) {
  console.log(err.stack);
  process.exit(1);
});
