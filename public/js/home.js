const statusCodes = {
  OK: 200
};

const getTextBox = function(classes, attributes) {
  const titleBox = document.createElement('input');
  const keys = Object.keys(attributes);
  titleBox.setAttribute('type', 'text');
  keys.forEach(key => titleBox.setAttribute(key, attributes[key]));
  classes.forEach(cssClass => titleBox.classList.add(cssClass));
  return titleBox;
};

const sendHttpGet = (url, callback) => {
  const req = new XMLHttpRequest();
  req.onload = function() {
    if (this.status === statusCodes.OK) {
      callback(this.responseText);
    }
  };
  req.open('GET', url);
  req.send();
};

const postHttpMsg = function(url, callback, message) {
  const req = new XMLHttpRequest();
  req.onload = function() {
    if (this.status === statusCodes.OK) {
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

const generateTasks = function(text) {
  const todoLists = document.querySelector('.todo-lists');
  const tasksJSON = JSON.parse(text);
  const tasks = tasksJSON.map(createTasks);
  todoLists.innerHTML = '';
  tasks.forEach(task => todoLists.appendChild(task));
};

const deleteTask = function() {
  const [, , task] = event.path;
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
  const text = event.target.previousElementSibling.value;

};

const generateSubtasks = function(subTasksHtml, subTask) {
  let attribute = '';
  let strikeHtml = subTask.task;
  if (subTask.isDone) {
    strikeHtml = `<strike>${subTask.task}</strike>`;
    attribute = 'checked';
  }
  const subTaskHtml = `<p><input type="checkbox" id="${subTask.id}"${attribute}>
    ${strikeHtml}</br></p>`;
  return subTasksHtml + subTaskHtml;
};

const appendChildHtml = function(element, html) {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  temp.firstChild && element.appendChild(temp.firstChild);
};

const createSubTasks = function(task) {
  const subTasks = document.createElement('div');
  subTasks.classList.add('subtasks');
  appendChildHtml(subTasks, task.subTasks.reduce(generateSubtasks, ''));
  return subTasks;
};

const createSubTasksAdder = function() {
  const attributes = {placeholder: 'Add your subTask Here'};
  const textBox = getTextBox(['sub-task-box', 'box'], attributes);
  const img = createImage('svg/plus.svg', ['svg', 'sub-task-svg'], addSubTask);
  const subTasksAdder = document.createElement('div');
  subTasksAdder.classList.add('sub-tasks-adder');
  subTasksAdder.appendChild(textBox);
  subTasksAdder.appendChild(img);
  return subTasksAdder;
};

const createTasks = function(task) {
  const taskContainer = document.createElement('div');
  const taskHeader = createTaskHeader(task);
  taskContainer.id = task.id;
  taskContainer.classList.add('task-container');
  taskContainer.appendChild(taskHeader);
  taskContainer.appendChild(createSubTasksAdder());
  taskContainer.appendChild(createSubTasks(task));
  return taskContainer;
};

const loadTasks = function() {
  sendHttpGet('/tasks', generateTasks);
};

const main = function() {
  loadTasks();
};

window.onload = main;
