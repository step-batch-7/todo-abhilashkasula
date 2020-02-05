const fs = require('fs');
const querystring = require('querystring');
const App = require('./app');
const TodoLists = require('./todoLists');
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

const todoLists = TodoLists.load(fs.readFileSync('./data/todo.json'));

const addTodo = function(req, res) {
  const {title} = req.body;
  todoLists.addTodo({title, tasks: []});
  serveTasks(req, res);
};

const serveTasks = function(req, res) {
  res.setHeader('Content-Type', CONTENT_TYPES.json);
  res.end(todoLists.toJSON());
};

const removeTodo = function(req, res) {
  const {id} = req.body;
  todoLists.removeTodo(id);
  serveTasks(req, res);
};

const addTask = function(req, res) {
  const {id, task} = req.body;
  todoLists.addTaskToTodo(id, {name: task, isDone: false});
  serveTasks(req, res);
};

const removeTask = function(req, res) {
  const {id, subId} = req.body;
  todoLists.removeTaskFromTodo(id, subId);
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
