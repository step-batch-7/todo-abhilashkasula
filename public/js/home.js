const statusCodes = {
  OK: 200
};

const getTaskAdderBox = () => document.querySelector('.task-adder');

const addHeader = function() {
  const taskAdder = getTaskAdderBox();
  const header = document.createElement('h3');
  header.textContent = 'Create A New Task';
  header.classList.add('task-adder-header');
  taskAdder.appendChild(header);
};

const getTitleBox = function() {
  const titleBox = document.createElement('input');
  titleBox.setAttribute('type', 'text');
  titleBox.setAttribute('name', 'title');
  titleBox.setAttribute('placeholder', 'Title');
  titleBox.setAttribute('required', 'true');
  titleBox.classList.add('title-box', 'box');
  return titleBox;
};

const getCreateButton = function() {
  const button = document.createElement('button');
  button.classList.add('create-task-button');
  button.textContent = 'Create';
  return button;
};

const createForm = function() {
  const taskAdder = getTaskAdderBox();
  const form = document.createElement('form');
  form.setAttribute('action', 'saveTask');
  form.setAttribute('method', 'POST');
  form.appendChild(getTitleBox());
  form.appendChild(getCreateButton());
  taskAdder.appendChild(form);
};

const setupTodoAdder = function() {
  addHeader();
  createForm();
};

const sendHttpGet = (url, callback) => {
  const req = new XMLHttpRequest();
  req.onload = function(){
    if(this.status === statusCodes.OK) {
      callback(this.responseText);
    }
  };
  req.open('GET', url);
  req.send();
};

const postHttpMsg = function(url, callback, message) {
  const req = new XMLHttpRequest();
  req.onload = function() {
    if(this.status === statusCodes.OK) {
      callback(this.responseText);
    }
  };
  req.open('POST', url);
  req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  req.send(message);
};

const deleteTask = function(event) {
  const [,, task] = event.path;
  const taskId = task.id;
  postHttpMsg('/removeTask', (text) => {
    const todoLists = document.querySelector('.todo-lists');
    const tasksJSON = JSON.parse(text);
    const tasks = tasksJSON.map(createTasks);
    todoLists.innerHTML = '';
    tasks.forEach(task => todoLists.appendChild(task));
  }, `id=${taskId}`);
};

const createImage = function(src, classes, eventListener) {
  const img = document.createElement('img');
  img.setAttribute('src', src);
  classes.forEach(cssClass => img.classList.add(cssClass));
  img.addEventListener('click', deleteTask);
  return img;
};

const getTaskHeader = function(task) {
  const taskHeader = document.createElement('div');
  const taskTitle = document.createElement('h3');
  const img = createImage('svg/remove.svg', ['svg'], deleteTask);
  taskTitle.classList.add('task-title');
  taskTitle.textContent = task.title;
  taskHeader.classList.add('task-headline');
  taskHeader.appendChild(taskTitle);
  taskHeader.appendChild(img);
  return taskHeader;
};

const createTasks = function(task) {
  const taskContainer = document.createElement('div');
  const taskHeader = getTaskHeader(task);
  taskContainer.id = task.id;
  taskContainer.classList.add('task-container');
  taskContainer.appendChild(taskHeader);
  return taskContainer;
};

const loadTasks = function() {
  sendHttpGet('/tasks', text => {
    const todoLists = document.querySelector('.todo-lists');
    const tasksJSON = JSON.parse(text);
    const tasks = tasksJSON.map(createTasks);
    tasks.forEach(task => todoLists.appendChild(task));
  });
};

const main = function() {
  setupTodoAdder();
  loadTasks();
};

window.onload = main;
