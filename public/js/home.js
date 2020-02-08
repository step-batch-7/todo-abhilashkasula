const statusCodes = {
  OK: 200
};

const sendXHR = (method, url, message, callback) => {
  const req = new XMLHttpRequest();
  req.onload = function() {
    if (this.status === statusCodes.OK) {
      callback(this.responseText);
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

const deleteTodo = function() {
  const [,,, task] = event.path;
  const taskId = task.id;
  sendXHR('POST', '/removeTodo', `id=${taskId}`, showTodos);
};

const removeTask = function() {
  const [, subTask,, task] = event.path;
  const [subTaskId, taskId] = [subTask, task].map(elem => elem.id);
  const body = `todoId=${taskId}&taskId=${subTaskId}`;
  sendXHR('POST', '/removeTask', body, showTodos);
};

const addTask = function(id) {
  const textBox = event.target.previousElementSibling;
  const text = textBox.value;
  const body = `id=${id}&task=${text}`;
  text && sendXHR('POST', '/addTask', body, showTodos);
  textBox.value = ''; 
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
  sendXHR('POST', '/changeTitle', `id=${id}&title=${text}`, showTodos);
};

const changeStatus = function() {
  const [, target,, parent] = event.path;
  const [taskId, todoId] = [target, parent].map(elem => elem.id);
  const body = `todoId=${todoId}&taskId=${taskId}`;
  sendXHR('POST', '/changeTaskStatus', body, showTodos);
};

const changeTask = function(id) {
  const [target,,, parent] = event.path;
  const todoId = parent.id;
  const body = `todoId=${todoId}&taskId=${id}&task=${target.innerText}`;
  sendXHR('POST', '/changeTask', body, showTodos);
};

const generateTasks = function(subTasksHtml, {id, name, isCompleted}) {
  const attribute = isCompleted ? 'checked' : '';
  const cssClass = isCompleted ? 'checked' : '';
  const subTaskElements = `<p id="${id}" class="${cssClass}">
    <input type="checkbox" onclick="changeStatus()"${attribute}>
    <span contenteditable="true" class="edit" onfocusout="changeTask(${id})">
    ${name}</span>
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
  <img src="svg/plus.svg" class="svg sub-task-svg" onclick="addTask(${id})">
  </div>`;
  return convertHtmlTextToNode(html);
};

const generateTodo = function(todo) {
  const taskContainer = document.createElement('div');
  taskContainer.id = todo.id;
  taskContainer.classList.add('task-container');
  taskContainer.appendChild(createTodoHeader(todo.title, todo.id));
  taskContainer.appendChild(generateTasksAdder(todo.id));
  taskContainer.appendChild(generateTasksContainer(todo.tasks));
  return taskContainer;
};

const showTodos = function(text) {
  const todoLists = document.querySelector('.todo-lists');
  const todoJSON = JSON.parse(text);
  const todos = todoJSON.map(generateTodo);
  todoLists.innerHTML = '';
  todos.forEach(todo => todoLists.appendChild(todo));
};

const loadTasks = function() {
  sendXHR('GET', '/tasks', '', showTodos);
};

window.onload = loadTasks;
