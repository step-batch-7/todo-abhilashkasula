const fs = require('fs');
const TODO_STORE = `${__dirname}/../data/todoLists.json`;

const readFile = (path) => fs.readFileSync(path);

const isFileNotPresent = function(path) {
  const stat = fs.existsSync(path) && fs.statSync(path);
  return !stat || !stat.isFile();
};

const loadTodoLists = function() {
  if(isFileNotPresent(TODO_STORE)) {
    return '[]';
  }
  return fs.readFileSync(TODO_STORE);
};

const writeTodoLists = (data) => fs.writeFileSync(TODO_STORE, data);

module.exports = {
  readFile,
  writeTodoLists,
  isFileNotPresent,
  loadTodoLists
};
