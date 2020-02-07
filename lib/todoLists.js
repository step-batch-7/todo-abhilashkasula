const Todo = require('./todo');
const NUMBER = 1;

class TodoLists {
  constructor() {
    this.todos = [];
  }

  addTodo(todo) {
    const id = this.generateId();
    this.todos.unshift(Todo.create(id, todo.title, todo.tasks));
  }

  removeTodo(id) {
    const todoId = this.todos.findIndex(todo => todo.id === +id);
    this.todos.splice(todoId, NUMBER);
  }
  
  findTodo(id) {
    return this.todos.find(todo => todo.id === +id);
  }
  
  addTaskToTodo(todoId, task) {
    const todo = this.findTodo(todoId);
    todo.addTask(task);
  }

  removeTaskFromTodo(todoId, taskId) {
    const todo = this.findTodo(todoId);
    todo.removeTask(taskId);
  }

  changeTaskStatus(todoId, taskId) {
    const todo = this.findTodo(todoId);
    todo.changeStatus(taskId);
  }

  changeTodoTitle(todoId, title) {
    const todo = this.findTodo(todoId);
    todo.changeTitle(title);
  }

  getTodoJson(id) {
    const todo = this.findTodo(id);
    return JSON.stringify(todo);
  }

  toJSON() {
    return JSON.stringify(this.todos);
  }

  generateId() {
    const latestTodo = this.todos[NUMBER - NUMBER];
    return latestTodo ? latestTodo.id + NUMBER : NUMBER;
  }

  static load(content) {
    const todoJSON = JSON.parse(content || '[]').reverse();
    const todoLists = new TodoLists();
    todoJSON.forEach(todo => {
      todoLists.addTodo(Todo.create(todo.id, todo.title, todo.tasks));
    });
    return todoLists;
  }
}

module.exports = TodoLists;
