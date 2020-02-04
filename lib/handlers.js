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

const data = [];

const getNextId = function(tasks) {
  const latestTask = tasks[NUMBER - NUMBER];
  return latestTask ? latestTask.id + NUMBER : NUMBER;
};

const addTodo = function(req, res) {
  const {title} = req.body;
  const id = getNextId(data);
  data.unshift({id, title, subTasks: []});
  serveTasks(req, res);
};

const serveTasks = function(req, res) {
  res.setHeader('Content-Type', CONTENT_TYPES.json);
  res.end(JSON.stringify(data));
};

const removeTask = function(req, res) {
  const {id} = req.body;
  const taskIndex = data.findIndex(task => task.id === +id);
  data.splice(taskIndex, NUMBER);
  serveTasks(req, res);
};

const addSubTask = function(req, res) {
  const {id, task} = req.body;
  const subTasks = data.find(task => task.id === +id).subTasks;
  subTasks.unshift({id: getNextId(subTasks), task, isDone: false});
  serveTasks(req, res);
};

const removeSubTask = function(req, res) {
  const {id, subId} = req.body;
  const subTasks = data.find(task => task.id === +id).subTasks;
  const subTaskId = subTasks.findIndex(task => task.id === +subId);
  subTasks.splice(subTaskId, NUMBER);
  serveTasks(req, res);
};

const app = new App();

app.use(readBody);
app.get('/tasks', serveTasks);
app.get('', serveStaticFile);
app.get('', serveNotFound);
app.post('/addTodo', addTodo);
app.post('/removeTask', removeTask);
app.post('/addSubTask', addSubTask);
app.post('/removeSubTask', removeSubTask);
app.post('', serveNotFound);
app.use(serveMethodNotFound);

module.exports = {app};
