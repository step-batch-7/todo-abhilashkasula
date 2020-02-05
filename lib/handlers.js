const fs = require('fs');
const querystring = require('querystring');
const App = require('./app');
const TodoLists = require('./todoLists');
const CONTENT_TYPES = require('./mimeTypes');
const STATIC_FOLDER = `${__dirname}/../public`;
const TODO_STORE = `${__dirname}/../data/todoLists.json`;

const getPathForRequested = function(reqUrl) {
  const url = reqUrl === '/' ? '/home.html' : reqUrl;
  return `${STATIC_FOLDER}/${url}`;
};

const isFileNotPresent = function(path) {
  const stat = fs.existsSync(path) && fs.statSync(path);
  return !stat || !stat.isFile();
};

const loadTodoLists = function() {
  if(isFileNotPresent(TODO_STORE)) {
    return '[]';
  }
  return fs.readFileSync(TODO_STORE);
};

const serveStaticFile = function(req, res, next) {
  const path = getPathForRequested(req.url);
  if (isFileNotPresent(path)) {
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

const todoLists = TodoLists.load(loadTodoLists());

const addTodo = function(req, res) {
  const {title} = req.body;
  todoLists.addTodo({title, tasks: []});
  serveTodoLists(req, res);
};

const serveTodoLists = function(req, res) {
  fs.writeFileSync(TODO_STORE, todoLists.toJSON());
  res.setHeader('Content-Type', CONTENT_TYPES.json);
  res.end(todoLists.toJSON());
};

const removeTodo = function(req, res) {
  const {id} = req.body;
  todoLists.removeTodo(id);
  serveTodoLists(req, res);
};

const addTask = function(req, res) {
  const {id, task} = req.body;
  todoLists.addTaskToTodo(id, {name: task, isCompleted: false});
  serveTodoLists(req, res);
};

const removeTask = function(req, res) {
  const {todoId, taskId} = req.body;
  todoLists.removeTaskFromTodo(todoId, taskId);
  serveTodoLists(req, res);
};

const changeTaskStatus = function(req, res) {
  const {todoId, taskId} = req.body;
  todoLists.changeTaskStatus(todoId, taskId);
  serveTodoLists(req, res);
};

const app = new App();

app.use(readBody);
app.get('/tasks', serveTodoLists);
app.get('', serveStaticFile);
app.get('', serveNotFound);
app.post('/addTodo', addTodo);
app.post('/removeTodo', removeTodo);
app.post('/addTask', addTask);
app.post('/removeTask', removeTask);
app.post('/changeTaskStatus', changeTaskStatus);
app.post('', serveNotFound);
app.use(serveMethodNotFound);

module.exports = {app};
