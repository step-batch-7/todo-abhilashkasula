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

const createTasks = function(task) {
  const taskContainer = document.createElement('div');
  const taskTitle = document.createElement('h3');
  taskContainer.id = task.id;
  taskContainer.classList.add('task-container');
  taskTitle.classList.add('task-title');
  taskTitle.textContent = task.title;
  taskContainer.appendChild(taskTitle);
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
