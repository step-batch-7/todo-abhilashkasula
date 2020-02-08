const querystring = require('querystring');
const App = require('./app');
const TodoLists = require('./todoLists');
const CONTENT_TYPES = require('./mimeTypes');
const {
  readFile,
  writeTodoLists,
  isFileNotPresent,
  loadTodoLists
} = require('./io');

const STATIC_FOLDER = `${__dirname}/../public`;

const getPathForRequested = function(reqUrl) {
  const url = reqUrl === '/' ? '/home.html' : reqUrl;
  return `${STATIC_FOLDER}/${url}`;
};

const serveStaticFile = function(req, res, next) {
  const path = getPathForRequested(req.url);
  if (isFileNotPresent(path)) {
    return next();
  }
  const [, extension] = path.match(/.*\.(.*)$/) || [];
  const contentType = CONTENT_TYPES[extension];
  const content = readFile(path);
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
  writeTodoLists(todoLists.toJSON());
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
  serveTodo(req, res, id);
};

const removeTask = function(req, res) {
  const {todoId, taskId} = req.body;
  todoLists.removeTaskFromTodo(todoId, taskId);
  serveTodo(req, res, todoId);
};

const changeTaskStatus = function(req, res) {
  const {todoId, taskId} = req.body;
  todoLists.changeTaskStatus(todoId, taskId);
  serveTodo(req, res, todoId);
};

const changeTitle = function(req, res) {
  const {title, id} = req.body;
  todoLists.changeTodoTitle(id, title);
  serveTodo(req, res, id);
};

const changeTask = function(req, res) {
  const {task, taskId, todoId} = req.body;
  todoLists.changeTodoTask(todoId, taskId, task);
  serveTodo(req, res, todoId);
};

const serveTodo = function(req, res, id) {
  writeTodoLists(todoLists.toJSON());
  res.setHeader('Content-Type', CONTENT_TYPES.json);
  res.end(JSON.stringify(todoLists.getTodo(id)));
};

const search = function(req, res) {
  const {text} = req.body;
  const todos = todoLists.searchTodo(text);
  res.setHeader('Content-Type', CONTENT_TYPES.json);
  res.end(JSON.stringify(todos));
};

const app = new App();

app.get('/tasks', serveTodoLists);
app.get('', serveStaticFile);
app.get('', serveNotFound);
app.use(readBody);
app.post('/addTodo', addTodo);
app.post('/removeTodo', removeTodo);
app.post('/addTask', addTask);
app.post('/removeTask', removeTask);
app.post('/changeTaskStatus', changeTaskStatus);
app.post('/changeTitle', changeTitle);
app.post('/changeTask', changeTask);
app.post('/search', search);
app.post('', serveNotFound);
app.use(serveMethodNotFound);

module.exports = {app};
