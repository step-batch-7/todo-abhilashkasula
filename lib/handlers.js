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

const serveStaticFile = function(req, res, next) {
  if(req.url === '/') {
    return redirect(req, res, '/login.html');
  }
  const path = `${STATIC_FOLDER}/${req.url}`;
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

const searchByTask = function(req, res) {
  const {text} = req.body;
  const todos = todoLists.searchByTask(text);
  res.setHeader('Content-Type', CONTENT_TYPES.json);
  res.end(JSON.stringify(todos));
};

const isValidUser = function(user, password) {
  return user === 'abhi' && password === 'abhi';
};

const loginUser = function(req, res) {
  const {username, password} = req.body;
  if(isValidUser(username, password)) {
    res.statusCode = 301;
    res.setHeader('Location', '/home.html');
    res.setHeader('Set-Cookie', 'session-id=1');
    res.end();
  }
  serveNotFound(req, res);
};

const redirect = function(req, res, url) {
  res.statusCode = 303;
  res.setHeader('Location', url);
  res.end();
};

const serveHomePage = function(req, res, next) {
  const {cookie} = req.headers;
  if(cookie) {
    return next();
  }
  redirect(req, res, '/login.html');
};

const serveLoginPage = function(req, res, next) {
  const {cookie} = req.headers;
  if(!cookie) {
    return next();
  }
  redirect(req, res, '/home.html');
};

const app = new App();

app.get('/tasks', serveTodoLists);
app.get('/home.html', serveHomePage);
app.get('/login.html', serveLoginPage);
app.get('', serveStaticFile);
app.get('', serveNotFound);
app.use(readBody);
app.post('/login', loginUser);
app.post('/addTodo', addTodo);
app.post('/removeTodo', removeTodo);
app.post('/addTask', addTask);
app.post('/removeTask', removeTask);
app.post('/changeTaskStatus', changeTaskStatus);
app.post('/changeTitle', changeTitle);
app.post('/changeTask', changeTask);
app.post('/searchByTask', searchByTask);
app.post('/searchByTitle', search);
app.post('', serveNotFound);
app.use(serveMethodNotFound);

module.exports = {app};
