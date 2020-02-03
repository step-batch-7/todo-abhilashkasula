const fs = require('fs');
const querystring = require('querystring');
const App = require('./app');
const CONTENT_TYPES = require('./mimeTypes');
const STATIC_FOLDER = `${__dirname}/../public`;
const NUMBER = 1;

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

const readBody = function(req, res, next) {
  let data = '';
  req.on('data', chunk => {
    data += chunk;
  });
  req.on('end', () => {
    req.body = querystring.parse(data);
    next();
  });
};

const data = [
  {
    id: 1,
    title: 'do now',
    subTasks: [
      {
        id: 1,
        task: 'buy bendi',
        isDone: false
      }
    ]
  }
];

const addTask = function(req, res) {
  const {title} = req.body;
  const lastTask = data[data.length - NUMBER];
  const id = lastTask ? lastTask.id + NUMBER : NUMBER;
  data.push({id, title, subTasks: []});
  res.statusCode = 200;
  res.setHeader('Content-Type', CONTENT_TYPES.json);
  res.end(JSON.stringify(data));
};

const serveTasks = function(req, res) {
  res.setHeader('Content-Type', CONTENT_TYPES.json);
  res.end(JSON.stringify(data));
};

const removeTask = function(req, res) {
  const {id} = req.body;
  const taskIndex = data.findIndex(task => task.id === +id);
  data.splice(taskIndex, NUMBER);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
};

const app = new App();

app.use(readBody);
app.get('/tasks', serveTasks);
app.get('', serveStaticFile);
app.get('', serveNotFound);
app.post('/addTask', addTask);
app.post('/removeTask', removeTask);
app.use(serveMethodNotFound);

module.exports = {app};
