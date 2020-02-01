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
    if(this.status === 200) {
      callback(this.responseText);
    }
  };
  req.open('GET', url);
  req.send();
};

const generateSubTasksHtml = function(html, subTask) {
  const generatedHtml = `<input type="checkbox" name="subTask" class="sub-task" value="${subTask.id}">
  ${subTask.value}</br>`;
  return html + generateHtml;
};

const generateHtml = function(html, task) {
  const subTasksHtml = task.subTasks.reduce(generateSubTasksHtml, '');
  const generatedHtml = `<div class="task-container" id="${task.id}">
    <h3 class=task-title>${task.title}</h3>
    ${subTasksHtml}
  </div>`;
  return html + generatedHtml;
};

const loadTasks = function() {
  sendHttpGet('/tasks', text => {
    const todoLists = document.querySelector('.todo-lists');
    const tasks = JSON.parse(text);
    const tasksHtml = tasks.reduce(generateHtml, '');
    console.log(tasksHtml);
    todoLists.innerHTML = tasksHtml;
  });
};

const main = function() {
  setupTodoAdder();
  loadTasks();
};

window.onload = main;
