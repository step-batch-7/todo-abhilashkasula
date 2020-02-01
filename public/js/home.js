const getTaskAdderBox = () => document.querySelector('.task-adder');

const addHeader = function() {
  const taskAdder = getTaskAdderBox();
  const header = document.createElement('h3');
  header.textContent = 'Create A New Task';
  header.classList.add('task-adder-header');
  taskAdder.appendChild(header);
};

const addTitleBox = function() {
  const taskAdder = getTaskAdderBox();
  const titleBox = document.createElement('input');
  titleBox.setAttribute('placeholder', 'Title');
  titleBox.classList.add('title-box', 'box');
  taskAdder.appendChild(titleBox);
};

const addCreateButton = function() {
  const taskAdder = getTaskAdderBox();
  const button = document.createElement('button');
  button.classList.add('create-task-button');
  button.textContent = 'Create';
  taskAdder.appendChild(button);
};

const setupTodoAdder = function() {
  addHeader();
  addTitleBox();
  addCreateButton();
};

const main = function() {
  setupTodoAdder();
};

window.onload = main;
