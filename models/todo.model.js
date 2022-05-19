const fs = require("fs");
const util = require("util");

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const path = require("path");

async function getData() {
  const data = await readFile(path.join(__dirname, "todoLst.json"), "utf8");
  if (!data) return [];
  return JSON.parse(data);
}

async function clearCompleted() {
  const tasks = await getData();
  const completedTask = tasks.filter((el) => !el.completed);
  writeFile(
    path.join(__dirname, "todoLst.json"),
    JSON.stringify(completedTask)
  );
  return completedTask;
}

async function toggleCompleteAll() {
  const tasks = await getData();
  const completedTask = tasks.map((el) => ({ ...el, completed: true }));
  writeFile(
    path.join(__dirname, "todoLst.json"),
    JSON.stringify(completedTask)
  );
  return completedTask;
}
async function toggleActiveAll() {
  const tasks = await getData();
  const completedTask = tasks.map((el) => ({ ...el, completed: false }));

  writeFile(
    path.join(__dirname, "todoLst.json"),
    JSON.stringify(completedTask)
  );
  return completedTask;
}
async function addTask(task) {
  const tasks = await getData();
  const key = tasks.length ? Math.max(...tasks.map((el) => el.key)) + 1 : 1;
  const newTask = {
    key,
    name: task,
    completed: false,
  };
  tasks.unshift(newTask);

  writeFile(path.join(__dirname, "todoLst.json"), JSON.stringify(tasks));
  return newTask;
}

async function editTaskValue(key, edit) {
  const tasks = await getData();

  const editedTasks = tasks.map((task) => {
    if (task.key === Number(key)) {
      return {
        ...task,
        ...edit,
      };
    } else {
      return task;
    }
  });

  writeFile(path.join(__dirname, "todoLst.json"), JSON.stringify(editedTasks));
  return editedTasks.find((el) => el.key === Number(key));
}

async function deleteTask(id) {
  const tasks = await getData();

  const editedTasks = tasks.filter((task) => task.key !== Number(id));

  writeFile(path.join(__dirname, "todoLst.json"), JSON.stringify(editedTasks));
  return editedTasks;
}
module.exports = {
  getData,
  addTask,
  deleteTask,
  editTaskValue,
  toggleCompleteAll,
  toggleActiveAll,
  clearCompleted,
};
