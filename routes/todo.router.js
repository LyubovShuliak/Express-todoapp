const express = require("express");
const router = express.Router();
const {
  addTask,
  getData,
  editTaskValue,
  deleteTask,
  toggleCompleteAll,
  toggleActiveAll,
  clearCompleted,
} = require("../models/todo.model");
router.get("/", async (request, response, next) => {
  const status = request.query.status;

  if (!status) {
    try {
      const todos = await getData();
      return response.json(todos);
    } catch (err) {
      return next(err);
    }
  } else {
    if (status === "completed") {
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
        todos.filter((el) => el.completed === Boolean(Number(status)))
      );
    } catch (err) {
      return next(err);
    }
  }
});

router.post("/", async (req, res, next) => {
  const setAll = req.query.set;
  const { value } = req.body;

  if (value && !setAll) {
    try {
      const task = await addTask(value);
      return res.send(task);
    } catch (error) {
      res.status(400);
      throw new Error("Task not created");
    }
  }

  if (setAll === "completed") {
    try {
      const tasks = await toggleCompleteAll();
      return res.send(tasks);
    } catch (error) {
      throw new Error("task does not exist");
    }
  }
  if (setAll === "active") {
    try {
      const tasks = await toggleActiveAll();
      return res.send(tasks);
    } catch (error) {
      throw new Error("task does not exist");
    }
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

router.post("/?set", async (req, res, next) => {});

module.exports = { router };
