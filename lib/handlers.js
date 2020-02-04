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
  data.unshift({id, title, tasks: []});
  serveTasks(req, res);
};

const serveTasks = function(req, res) {
  res.setHeader('Content-Type', CONTENT_TYPES.json);
  res.end(JSON.stringify(data));
};

const removeTodo = function(req, res) {
  const {id} = req.body;
  const todoIndex = data.findIndex(todo => todo.id === +id);
  data.splice(todoIndex, NUMBER);
  serveTasks(req, res);
};

const addTask = function(req, res) {
  const {id, task} = req.body;
  const tasks = data.find(task => task.id === +id).tasks;
  tasks.unshift({id: getNextId(tasks), task, isDone: false});
  serveTasks(req, res);
};

const removeTask = function(req, res) {
  const {id, subId} = req.body;
  const tasks = data.find(task => task.id === +id).tasks;
  const subTaskId = tasks.findIndex(task => task.id === +subId);
  tasks.splice(subTaskId, NUMBER);
  serveTasks(req, res);
};

const app = new App();

app.use(readBody);
app.get('/tasks', serveTasks);
app.get('', serveStaticFile);
app.get('', serveNotFound);
app.post('/addTodo', addTodo);
app.post('/removeTodo', removeTodo);
app.post('/addTask', addTask);
app.post('/removeTask', removeTask);
app.post('', serveNotFound);
app.use(serveMethodNotFound);

module.exports = {app};
