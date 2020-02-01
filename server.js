const http = require('http');
const {app} = require('./lib/handlers');

const port = 8000;
const listeningLog = 'server is listening';

const main = function() {
  const server = new http.Server(app.handleRequest.bind(app));
  server.listen(port, () => process.stderr.write(listeningLog));
};

main();
