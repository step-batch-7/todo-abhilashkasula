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
  const [, , task] = event.path;
  const taskId = task.id;
  sendXHR('POST', '/removeTodo', `id=${taskId}`, showTodos);
};

const removeTask = function() {
  const [, subTask,, task] = event.path;
  const [subTaskId, taskId] = [subTask, task].map(elem => elem.id);
  const body = `todoId=${taskId}&taskId=${subTaskId}`;
  sendXHR('POST', '/removeTask', body, showTodos);
};

const addTask = function() {
  const [target,, parent] = event.path;
  const text = target.previousElementSibling.value;
  const taskId = parent.id;
  text && sendXHR('POST', '/addTask', `id=${taskId}&task=${text}`, showTodos);
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

const toggleTasks = function() {
  rotate();
  const [,, parent] = event.path;
  const subTasks = parent.nextElementSibling.nextElementSibling;
  const display = subTasks.style['display'];
  subTasks.style['display'] = display === 'flex' ? 'none' : 'flex';
};

const createTodoHeader = function(taskTitle) {
  const classes = 'svg svg-remove';
  const html = `<div class="task-headline">
    <h3 class="task-title">${taskTitle}</h3>
    <div><img src="svg/arrow.svg" class="svg arrow" onclick="toggleTasks()">
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

const changeStatus = function(id) {
  const [, target,, parent] = event.path;
  const [taskId, todoId] = [target, parent].map(elem => elem.id);
  const body = `todoId=${todoId}&taskId=${taskId}`;
  sendXHR('POST', '/changeTaskStatus', body, showTodos);
};

const addCheckBox = function(isCompleted, name) {
  const attribute = isCompleted ? 'checked' : '';
  const nameWithStyle = isCompleted ? `<strike>${name}</strike>` : name;
  return `<input type="checkbox" onclick="changeStatus()" ${attribute}>
  ${nameWithStyle}`;
};

const generateTasks = function(subTasksHtml, subTask) {
  const subTaskElements = `<p id="${subTask.id}">
    ${addCheckBox(subTask.isCompleted, subTask.name)}
    <img src="svg/remove.svg" class="svg svg-task-remove"onclick="removeTask()">
    </br></p>`;
  return subTasksHtml + subTaskElements;
};

const generateTasksContainer = function(tasks) {
  const subTasks = tasks.reduce(generateTasks, '');
  const html = `<div class="subtasks">${subTasks}</div>`;
  return convertHtmlTextToNode(html);
};

const generateTasksAdder = function() {
  const placeholder = 'Add your sub task here';
  const html = `<div class="sub-tasks-adder">
  <input type="text" class="sub-task-box box" placeholder="${placeholder}">
  <img src="svg/plus.svg" class="svg sub-task-svg" onclick="addTask()">
  </div>`;
  return convertHtmlTextToNode(html);
};

const generateTodo = function(task) {
  const taskContainer = document.createElement('div');
  taskContainer.id = task.id;
  taskContainer.classList.add('task-container');
  taskContainer.appendChild(createTodoHeader(task.title));
  taskContainer.appendChild(generateTasksAdder());
  taskContainer.appendChild(generateTasksContainer(task.tasks));
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
