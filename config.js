const {env} = require('process');

const config = {
  TODO_LISTS_PATH: `${__dirname}/${env.DATA_STORE}`
};

module.exports = config;
