const statusCodes = {
  OK: 200
};

const sendXHR = (method, url, message, callback) => {
  const req = new XMLHttpRequest();
  req.onload = function() {
    if (this.status === statusCodes.OK) {
      callback(JSON.parse(this.responseText));
    }
  };
  req.open(method, url);
  req.send(message);
};

const addTodo = function() {
  const inputBox = event.target.parentElement.previousElementSibling;
  const text = inputBox.value;
  text && sendXHR('POST', '/addTodo', `title=${text}`, showTodos);
  inputBox.value = '';
};

const updateTodo = function(todoJSON) {
  const todo = document.querySelector(`.task-container[id="${todoJSON.id}"]`);
  todo.innerHTML = '';
  addChildren(todo, todoJSON);
};

const deleteTodo = function() {
  const [,,, task] = event.path;
  const taskId = task.id;
  sendXHR('POST', '/removeTodo', `id=${taskId}`, showTodos);
};

const removeTask = function() {
  const [, subTask,, task] = event.path;
  const [subTaskId, taskId] = [subTask, task].map(elem => elem.id);
  const body = `todoId=${taskId}&taskId=${subTaskId}`;
  sendXHR('POST', '/removeTask', body, updateTodo);
};

const addTask = function(id) {
  const textBox = event.target.previousElementSibling;
  const text = textBox.value;
  const body = `id=${id}&task=${text}`;
  text && sendXHR('POST', '/addTask', body, updateTodo);
  textBox.value = ''; 
};

const search = function() {
  const text = document.querySelector('#search').value;
  sendXHR('POST', '/search', `text=${text}`, showTodos);
};

const convertHtmlTextToNode = function(html) {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.firstChild;
};

const selectTitle = function() {
  const [, parent] = event.path;
  const title = parent.previousElementSibling.firstChild;
  title.focus();
};

const createTodoHeader = function(title, id) {
  const classes = 'svg svg-remove';
  const html = `<div class="task-headline">
    <div><input class="box task-title"
    type="text" onfocusout="changeTitle(${id})" value="${title}"> </div>
    <div><img src="svg/edit.svg" class="svg svg-edit" onclick="selectTitle()">
    <img src="svg/remove.svg" class="${classes}" onclick="deleteTodo()"></div>
    </div>`;
  return convertHtmlTextToNode(html);
};

const changeTitle = function(id) {
  const text = event.target.value;
  sendXHR('POST', '/changeTitle', `id=${id}&title=${text}`, updateTodo);
};

const changeStatus = function() {
  const [, target,, parent] = event.path;
  const [taskId, todoId] = [target, parent].map(elem => elem.id);
  const body = `todoId=${todoId}&taskId=${taskId}`;
  sendXHR('POST', '/changeTaskStatus', body, updateTodo);
};

const changeTask = function(id) {
  const [target,,, parent] = event.path;
  const todoId = parent.id;
  const body = `todoId=${todoId}&taskId=${id}&task=${target.value}`;
  sendXHR('POST', '/changeTask', body, updateTodo);
};

const generateTasks = function(subTasksHtml, {id, name, isCompleted}) {
  const attribute = isCompleted ? 'checked' : '';
  const subTaskElements = `<p id="${id}">
    <input type="checkbox" onclick="changeStatus()"${attribute}>
    <input type="text" class="edit box ${attribute}" value=" ${name}"
    onfocusout="changeTask(${id})">
    <img src="svg/remove.svg" class="svg svg-task-remove"onclick="removeTask()">
    </br></p>`;
  return subTasksHtml + subTaskElements;
};

const generateTasksContainer = function(tasks) {
  const subTasks = tasks.reduce(generateTasks, '');
  const html = `<div class="subtasks">${subTasks}</div>`;
  return convertHtmlTextToNode(html);
};

const generateTasksAdder = function(id) {
  const placeholder = 'Add your sub task here';
  const html = `<div class="sub-tasks-adder">
  <input type="text" class="sub-task-box box" placeholder="${placeholder}">
  <img src="svg/plus.svg" class="sub-task-svg" onclick="addTask(${id})">
  </div>`;
  return convertHtmlTextToNode(html);
};

const addChildren = function(todo, {id, title, tasks}) {
  todo.appendChild(createTodoHeader(title, id));
  todo.appendChild(generateTasksAdder(id));
  todo.appendChild(generateTasksContainer(tasks));
};

const generateTodo = function(todo) {
  const taskContainer = document.createElement('div');
  taskContainer.id = todo.id;
  taskContainer.classList.add('task-container');
  addChildren(taskContainer, todo);
  return taskContainer;
};

const showTodos = function(todoLists) {
  const todoListsContainer = document.querySelector('.todo-lists');
  const todos = todoLists.map(generateTodo);
  todoListsContainer.innerHTML = '';
  todos.forEach(todo => todoListsContainer.appendChild(todo));
};

const loadTasks = function() {
  sendXHR('GET', '/tasks', '', showTodos);
};

window.onload = loadTasks;
