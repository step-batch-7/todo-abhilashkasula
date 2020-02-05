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
  const inputBox = event.target.previousElementSibling;
  sendXHR('POST', '/addTodo', `title=${inputBox.value}`, showTasks);
  inputBox.value = '';
};

const deleteTodo = function() {
  const [, , task] = event.path;
  const taskId = task.id;
  sendXHR('POST', '/removeTodo', `id=${taskId}`, showTasks);
};

const removeTask = function() {
  const [, subTask,, task] = event.path;
  const [subTaskId, taskId] = [subTask, task].map(elem => elem.id);
  const body = `todoId=${taskId}&taskId=${subTaskId}`;
  sendXHR('POST', '/removeTask', body, showTasks);
};

const addTask = function() {
  const [target,, parent] = event.path;
  const text = target.previousElementSibling.value;
  const taskId = parent.id;
  sendXHR('POST', '/addTask', `id=${taskId}&task=${text}`, showTasks);
};

const convertHtmlTextToNode = function(html) {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.firstChild;
};

const createTaskHeader = function(taskTitle) {
  const html = `<div class="task-headline">
    <h3 class="task-title">${taskTitle}</h3>
    <img src="svg/remove.svg" class="svg" onclick="deleteTodo()"></div>`;
  return convertHtmlTextToNode(html);
};

const changeStatus = function(id) {
  const [, target,, parent] = event.path;
  const [taskId, todoId] = [target, parent].map(elem => elem.id);
  const body = `todoId=${todoId}&taskId=${taskId}`;
  sendXHR('POST', '/changeTaskStatus', body, showTasks);
};

const addCheckBox = function(isCompleted, name) {
  const attribute = isCompleted ? 'checked' : '';
  const nameWithStyle = isCompleted ? `<strike>${name}</strike>` : name;
  return `<input type="checkbox" onclick="changeStatus()" ${attribute}>
  ${nameWithStyle}`;
};

const generateSubtasks = function(subTasksHtml, subTask) {
  const subTaskElements = `<p id="${subTask.id}">
    ${addCheckBox(subTask.isCompleted, subTask.name)}
    <img src="svg/remove.svg" class="svg svg-remove" onclick="removeTask()">
    </br></p>`;
  return subTasksHtml + subTaskElements;
};

const generateSubTasksContainer = function(tasks) {
  const subTasks = tasks.reduce(generateSubtasks, '');
  const html = `<div class="subtasks">${subTasks}</div>`;
  return convertHtmlTextToNode(html);
};

const generateSubTasksAdder = function() {
  const placeholder = 'Add your sub task here';
  const html = `<div class="sub-tasks-adder">
  <input type="text" class="sub-task-box box" placeholder="${placeholder}">
  <img src="svg/plus.svg" class="svg sub-task-svg" onclick="addTask()">
  </div>`;
  return convertHtmlTextToNode(html);
};

const generateTask = function(task) {
  const taskContainer = document.createElement('div');
  taskContainer.id = task.id;
  taskContainer.classList.add('task-container');
  taskContainer.appendChild(createTaskHeader(task.title));
  taskContainer.appendChild(generateSubTasksAdder());
  taskContainer.appendChild(generateSubTasksContainer(task.tasks));
  return taskContainer;
};

const showTasks = function(text) {
  const todoLists = document.querySelector('.todo-lists');
  const todoJSON = JSON.parse(text);
  const todos = todoJSON.map(generateTask);
  todoLists.innerHTML = '';
  todos.forEach(todo => todoLists.appendChild(todo));
};

const loadTasks = function() {
  sendXHR('GET', '/tasks', '', showTasks);
};

window.onload = loadTasks;
