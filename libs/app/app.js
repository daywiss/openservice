const lodash = require("lodash");
const Promise = require("bluebird");
const assert = require("assert");
const Service = require("../service");
const Config = require("../config");

module.exports = async (config) => {
  //sets directories to search for files,
  //researched from https://gist.github.com/branneman/8048520
  //allows user to load external files easier
  if (config.paths)
    require.main.paths = [
      ...lodash.castArray(config.paths),
      ...require.main.paths,
    ];

  //create a default object for openservice meta options
  const osConfig = lodash.merge(config.openservice, {});

  const { compile } = Config(osConfig);

  let transports = lodash.mapValues(config.transports, (value, key) => {
    assert(
      value.require,
      `Transport ${key} missing "require" field to specify file`
    );
    const transport = require.main.require(value.require);
    assert(transport, "Transport file not found");
    return transport(value.config);
  });

  transports = await Promise.props(transports);

  return Promise.mapSeries(compile(config), (compiledConfig) => {
    console.log("loading", compiledConfig.name);
    if (lodash.isFunction(compiledConfig.require)) {
      return Service(
        compiledConfig.require,
        compiledConfig,
        transports,
        osConfig
      );
    }
    return Service(
      require.main.require(compiledConfig.require),
      compiledConfig,
      transports,
      osConfig
    );
  });
};
