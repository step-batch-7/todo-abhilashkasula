const NUMBER = 1;

const duplicate = function(tasks) {
  return tasks.map(task => {
    return {id: task.id, name: task.name, isCompleted: task.isCompleted};
  });
};

const reproduce = function(task) {
  const keys = Object.keys(task);
  return keys.reduce((newTask, key) => {
    newTask[key] = task[key];
    return newTask;
  }, {});
};

class Todo {
  constructor(id, title, tasks) {
    this.id = id;
    this.title = title;
    this.tasks = tasks;
  }

  addTask(task) {
    const duplicatedTask = reproduce(task);
    duplicatedTask.id = this.generateId();
    this.tasks.unshift(duplicatedTask);
  }

  removeTask(id) {
    const taskId = this.tasks.findIndex(task => task.id === +id);
    this.tasks.splice(taskId, NUMBER);
  }

  changeStatus(id) {
    const task = this.tasks.find(task => task.id === +id);
    task['isCompleted'] = !task['isCompleted'];
  }

  generateId() {
    const latestTask = this.tasks[NUMBER - NUMBER];
    return latestTask ? latestTask.id + NUMBER : NUMBER;
  }

  static create(id, title, tasks) {
    return new Todo(id, title, duplicate(tasks));
  }
}

module.exports = Todo;