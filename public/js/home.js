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
  sendXHR('POST', '/removeTask', body, text => showTasks(taskId, text));
};

const addTask = function(id) {
  const textBox = event.target.previousElementSibling;
  const text = textBox.value;
  const body = `id=${id}&task=${text}`;
  text && sendXHR('POST', '/addTask', body, text => showTasks(id, text));
  textBox.value = '';
  const toggler = document.querySelector(`img[onclick="toggleTasks(${id})"]`);
  toggler.classList.contains('initial') && toggler.click(); 
};

const convertHtmlTextToNode = function(html) {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.firstChild;
};

const rotate = function() {
  const target = event.target;
  if(target.classList.contains('rotated')) {
    target.classList.remove('rotated', 'rotate');
    return target.classList.add('rotate-back', 'initial');
  }
  target.classList.remove('initial', 'rotate-back'); 
  target.classList.add('rotate', 'rotated');
};

const toggleTasks = function(id) {
  rotate();
  const tasks = document.querySelector(`.task-container[id="${id}"]`).lastChild;
  const display = tasks.style['display'];
  tasks.style['display'] = display === 'flex' ? 'none' : 'flex';
};

const createTodoHeader = function(title, id) {
  const classes = 'svg svg-remove';
  const html = `<div class="task-headline">
    <div><input class="box task-title" type="text" onfocusout="changeTitle(${id})" value="${title}"> </div>
    <div><img src="svg/arrow.svg" class="svg arrow"onclick="toggleTasks(${id})">
    <img src="svg/plus.svg" class="svg plus" onclick="toggleTaskAdder()">
    <img src="svg/remove.svg" class="${classes}" onclick="deleteTodo()"></div>
    </div>`;
  return convertHtmlTextToNode(html);
};

const toggleTaskAdder = function() {
  const [,, sibling] = event.path;
  const taskAdder = sibling.nextElementSibling;
  const display = taskAdder.style['display'];
  taskAdder.style['display'] = display === 'flex' ? 'none' : 'flex';
};

const showTasks = function(todoId, text) {
  const container = document.querySelector(`.task-container[id="${todoId}"]`);
  const subTasks = container.lastChild;
  const todoJSON = JSON.parse(text);
  const todo = todoJSON.find(todo => todo.id === +todoId);
  subTasks.innerHTML = todo.tasks.reduce(generateTasks, '');
};

const changeTitle = function(id) {
  const text = event.target.value;
  const render = function(text) { 
    const todo = JSON.parse(text);
    event.target.value = todo.title;
  };
  sendXHR('POST', '/changeTitle', `id=${id}&title=${text}`, render);
};

const changeStatus = function(id) {
  const [, target,, parent] = event.path;
  const [taskId, todoId] = [target, parent].map(elem => elem.id);
  const body = `todoId=${todoId}&taskId=${taskId}`;
  sendXHR('POST', '/changeTaskStatus', body, (text) => showTasks(todoId, text));
};

const generateTasks = function(subTasksHtml, subTask) {
  const attribute = subTask.isCompleted ? 'checked' : '';
  const cssClass = subTask.isCompleted ? 'checked' : '';
  const subTaskElements = `<p id="${subTask.id}" class="${cssClass}">
    <input type="checkbox" onclick="changeStatus()"${attribute}> ${subTask.name}
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
