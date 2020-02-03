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

const addTask = function() {
  const inputBox = event.target.previousElementSibling;
  postHttpMsg('/addTask', generateTasks, `title=${inputBox.value}`);
  inputBox.value = '';
};

const getCreateButton = function() {
  const button = document.createElement('button');
  button.classList.add('create-task-button');
  button.textContent = 'Create';
  button.addEventListener('click', addTask);
  return button;
};

const createForm = function() {
  const taskAdder = getTaskAdderBox();
  const div = document.createElement('div');
  div.appendChild(getTitleBox());
  div.appendChild(getCreateButton());
  taskAdder.appendChild(div);
};

const setupTodoAdder = function() {
  addHeader();
  createForm();
};

const generateTasks = function(text) {
  const todoLists = document.querySelector('.todo-lists');
  const tasksJSON = JSON.parse(text);
  const tasks = tasksJSON.map(createTasks);
  todoLists.innerHTML = '';
  tasks.forEach(task => todoLists.appendChild(task));
};

const deleteTask = function(event) {
  const [,, task] = event.path;
  const taskId = task.id;
  postHttpMsg('/removeTask', generateTasks, `id=${taskId}`);
};

const createImage = function(src, classes, eventListener) {
  const img = document.createElement('img');
  img.setAttribute('src', src);
  classes.forEach(cssClass => img.classList.add(cssClass));
  img.addEventListener('click', eventListener);
  return img;
};

const createTaskHeader = function(task) {
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

const addSubTask = function() {

};

const createSubTasks = function(task) {
  const subTasks = document.createElement('div');
  const textBox = document.createElement('input');
  const img = createImage('svg/plus.svg', ['svg', 'sub-task-svg'], addSubTask);
  textBox.setAttribute('type', 'text');
  textBox.setAttribute('placeholder', 'Add your subTask Here');
  textBox.classList.add('box', 'sub-task-box');
  subTasks.classList.add('sub-tasks-adder');
  subTasks.appendChild(textBox);
  subTasks.appendChild(img);
  return subTasks;
};

const createTasks = function(task) {
  const taskContainer = document.createElement('div');
  const taskHeader = createTaskHeader(task);
  const subTasks = createSubTasks(task);
  taskContainer.id = task.id;
  taskContainer.classList.add('task-container');
  taskContainer.appendChild(taskHeader);
  taskContainer.appendChild(subTasks);
  return taskContainer;
};

const loadTasks = function() {
  sendHttpGet('/tasks', generateTasks);
};

const main = function() {
  setupTodoAdder();
  loadTasks();
};

window.onload = main;
