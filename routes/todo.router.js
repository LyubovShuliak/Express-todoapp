const express = require("express");
const router = express.Router();
const {
  addTask,
  getData,
  editTaskValue,
  deleteTask,
  toggleCompleteAll,
  toggleNOTCompleteAll,
  clearCompleted,
} = require("../models/todo.model");
router.get("/", async (request, response, next) => {
  const filter = request.query;
  console.log(request.originalUrl);

  if (!Object.keys(filter).length) {
    console.log("ups");
    try {
      const todos = await getData();
      return response.json(todos);
    } catch (err) {
      return next(err);
    }
  } else {
    if (filter.filter === "completed") {
      try {
        const todos = (await clearCompleted()) || [];

        return response.json(todos);
      } catch (err) {
        return next(err);
      }
    }
    try {
      const todos = await getData();
      return response.json(
        todos.filter((el) => el.completed === Boolean(Number(filter.filter)))
      );
    } catch (err) {
      return next(err);
    }
  }
});

router.post("/", async (req, res, next) => {
  const { value } = req.body;
  try {
    const task = await addTask(value);
    return res.send(task);
  } catch (error) {
    res.status(400);
    throw new Error("Task not created");
  }
});

router.patch("/:id", async (req, res, next) => {
  const key = req.params.id;
  const edit = req.body;

  try {
    const task = await editTaskValue(key, edit);

    return res.send(task);
  } catch (error) {
    throw new Error("task does not exist");
  }
});
router.get("/:id", async (req, res, next) => {
  const key = req.params.id;
  try {
    const tasks = await deleteTask(key);
    return res.json(tasks);
  } catch (error) {
    throw new Error("task does not exist");
  }
});
router.post("/completed", async (req, res, next) => {
  try {
    const tasks = await toggleCompleteAll();
    console.log(tasks);
    return res.send(tasks);
  } catch (error) {
    throw new Error("task does not exist");
  }
});
router.post("/notcompleted", async (req, res, next) => {
  try {
    const tasks = await toggleNOTCompleteAll();
    console.log(tasks);
    return res.send(tasks);
  } catch (error) {
    throw new Error("task does not exist");
  }
});

module.exports = { router };
