const fs = require('fs');
const App = require('./app');
const CONTENT_TYPES = require('./mimeTypes');
const STATIC_FOLDER = `${__dirname}/../public`;

const getUrl = function(url) {
  return url === '/' ? '/home.html' : url;
};

const areStatsNotOk = function(stat) {
  return !stat || !stat.isFile();
};

const serveStaticFile = function(req, res, next) {
  const reqUrl = getUrl(req.url);
  const path = `${STATIC_FOLDER}${reqUrl}`;
  const stat = fs.existsSync(path) && fs.statSync(path);
  if (areStatsNotOk(stat)) {
    return next();
  }
  const [, extension] = path.match(/.*\.(.*)$/) || [];
  const contentType = CONTENT_TYPES[extension];
  const content = fs.readFileSync(path);
  res.setHeader('Content-Type', contentType);
  res.end(content);
};

const serveNotFound = function(req, res) {
  res.statusCode = 404;
  res.end('Not Found');
};

const serveMethodNotFound = function(req, res) {
  res.statusCode = 405;
  res.end('Method Not Found');
};

const app = new App();

app.get('', serveStaticFile);
app.get('', serveNotFound);
app.use(serveMethodNotFound);

module.exports = {app};
