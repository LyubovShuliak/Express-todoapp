const states = ["completed", "editing"];
const URL_REQ = "http://localhost:3636/api";
let LENGTH = 0;
const addTaskInput = document.querySelector(".new-todo");
const todoList = document.querySelector(".todo-list");
const toggleCompletedAll = document.querySelector(".toggle-all");
const taskCount = document.querySelector(".todo-count");

function toggleAllCompeted() {
  document.querySelectorAll(".toggle").forEach((el) => (el.checked = true));
  document
    .querySelectorAll("li")
    .forEach((el) => el.classList.add("completed"));
  LENGTH = 0;
  taskCount.innerText = `${LENGTH} items left`;
}
function select(e) {
  document.querySelector(".selected").classList.remove("selected");
  e.target.classList.add("selected");
}

function createListItem(key, name, completed) {
  const listItem = document.createElement("li");

  const divItem = document.createElement("div");
  divItem.setAttribute("class", "view");

  const toggleItem = document.createElement("input");
  toggleItem.setAttribute("type", "checkbox");
  toggleItem.setAttribute("class", "toggle");
  toggleItem.setAttribute("id", `${key}`);
  if (completed) {
    listItem.classList.add("completed");
    toggleItem.checked = true;
  }

  const labelItem = document.createElement("label");
  labelItem.setAttribute("class", "label");
  labelItem.setAttribute("for", `${key}`);
  labelItem.innerText = name;

  const destroy = document.createElement("button");
  destroy.setAttribute("class", "destroy");

  const editItem = document.createElement("input");
  editItem.setAttribute("type", "text");
  editItem.setAttribute("class", "edit");
  return {
    divItem,
    labelItem,
    listItem,
    destroy,
    editItem,
    toggleItem,
  };
}

async function editTask(e, key, listItem, labelItem, toggleItem) {
  const newValue = e.target.value;

  if (e.code === "Enter" && newValue) {
    await fetch(`${URL_REQ}/${key}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newValue,
      }),
    });
    listItem.classList.toggle("editing");
    labelItem.innerText = newValue;

    e.target.value = "";
  } else if (e.code === "Enter") {
    listItem.classList.toggle("editing");
  }
  toggleItem.disabled = false;
}
function deleteTask(e, key, listItem, completed) {
  fetch(`${URL_REQ}/${key}`)
    .then((data) => {
      todoList.removeChild(listItem);
      return data.json();
    })
    .then((res) => {
      if (res[0].completed === false) {
        LENGTH--;
        taskCount.innerText =
          LENGTH === 1 ? `${LENGTH} item left` : `${LENGTH} items left`;
      }
    });
}
async function toggleCompleted(e, key) {
  fetch(`${URL_REQ}`).then(async (data) => {
    const fetchedTasks = await data.json();
    const task = fetchedTasks.find((el) => el.key === key);
    const elCurentlyEditing = document.querySelector(".editing");
    if (elCurentlyEditing) {
      elCurentlyEditing.classList.remove("editing");
    }
    if (e.target.checked) {
      fetch(`${URL_REQ}/${key}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: true,
        }),
      });
      LENGTH--;
    } else {
      fetch(`${URL_REQ}/${key}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: false,
        }),
      });
      LENGTH++;
    }
    taskCount.innerText =
      LENGTH === 1 ? `${LENGTH} item left` : `${LENGTH} items left`;
  });
}

toggleCompletedAll.addEventListener("click", async (e) => {
  if (e.target.checked) {
    fetch(`${URL_REQ}/?set=completed`, {
      method: "POST",

      body: null,
    }).then(() => toggleAllCompeted());
  } else {
    fetch(`${URL_REQ}/?set=active`, {
      method: "POST",
      body: null,
    })
      .then((data) => data.json())
      .then((res) => {
        LENGTH = res.length;
        taskCount.innerText = `${LENGTH} items left`;
      });
    document.querySelectorAll(".toggle").forEach((el) => (el.checked = false));
    document
      .querySelectorAll("li")
      .forEach((el) => el.classList.remove("completed"));
  }
});

function populateTask(task) {
  const { key, name, completed } = task;
  const { divItem, labelItem, listItem, destroy, editItem, toggleItem } =
    createListItem(key, name, completed);

  //events
  labelItem.addEventListener("click", () => {
    editItem.value = labelItem.innerText;
    const editing = document.querySelector(".editing");
    if (editing) {
      editing.classList.remove("editing");

      editing.querySelector(".toggle").disabled = false;
    } else {
      toggleItem.disabled = true;
      listItem.classList.toggle("editing");
    }
  });
  editItem.addEventListener(
    "keypress",
    async (e) => await editTask(e, key, listItem, labelItem, toggleItem)
  );
  destroy.addEventListener("click", (e) =>
    deleteTask(e, key, listItem, completed)
  );
  toggleItem.addEventListener("click", (e) => {
    listItem.classList.toggle("completed");
    toggleCompleted(e, key);
    if (!e.target.checked) {
      toggleCompletedAll.checked = false;
    }
  });
  //events

  divItem.append(toggleItem, labelItem, destroy);
  listItem.append(divItem, editItem);

  return listItem;
}

async function addTask(e) {
  const todo = e.target.value;
  if (e.which === 13) {
    await fetch(`${URL_REQ}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value: todo }),
    })
      .then((res) => res.json())
      .then((data) => {
        const task = populateTask(data);
        todoList.appendChild(task);
      });
    e.target.value = "";
    LENGTH++;
  }

  taskCount.innerText =
    LENGTH === 1 ? `${LENGTH} item left` : `${LENGTH} items left`;
}

async function fetchTasks(filter) {
  const query = filter ? `?status=${filter}` : "";
  let p;
  await fetch(`${URL_REQ}/${query}`).then(async (data) => {
    const fetchedTasks = await data.json();
    const finder = fetchedTasks.find((el, i, arr) => !el.completed);
    if (fetchedTasks.length && !finder) {
      toggleCompletedAll.checked = true;
    }
    LENGTH = fetchedTasks.filter((el) => !el.completed).length;
    taskCount.innerText =
      LENGTH === 1 ? `${LENGTH} item left` : `${LENGTH} items left`;
    const neTasks = fetchedTasks.map(populateTask);

    todoList.append(...neTasks);
    p = neTasks;
  });
  return p;
}

addTaskInput.addEventListener("keydown", async (e) => await addTask(e));

document.querySelector(".get_all").addEventListener("click", async (e) => {
  select(e);
  todoList.replaceChildren(...(await fetchTasks()));
});
document.querySelector(".completed").addEventListener("click", async (e) => {
  select(e);
  const active = await fetchTasks("1");

  if (!active.length) {
    todoList.innerHTML = "";
    return;
  }
  todoList.replaceChildren(...active);
});
document.querySelector(".active").addEventListener("click", async (e) => {
  select(e);
  const completed = await fetchTasks("0");

  if (!completed.length) {
    todoList.innerHTML = "";
    return;
  }

  todoList.replaceChildren(...completed);
});
document
  .querySelector(".clear-completed")
  .addEventListener("click", async () => {
    const completed = await fetchTasks("completed");

    if (!completed.length) {
      todoList.innerHTML = "";
      return;
    }

    todoList.replaceChildren(...completed);
  });
fetchTasks();

function previewFile() {
  var preview = document.querySelector("img");
  var file = document.querySelector("input[type=file]").files[0];
  var reader = new FileReader();

  reader.onloadend = function () {
    const blob = new Blob([reader.result], { type: "image/jpg" });
    console.log(blob);
  };

  if (file) {
    reader.readAsArrayBuffer(file);
  }
}
document
  .querySelector("input[type=file]")
  .addEventListener("change", previewFile);
