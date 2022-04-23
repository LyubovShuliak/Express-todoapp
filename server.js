const express = require("express");
const path = require("path");

const bodyParser = require("body-parser");
const { router } = require("./routes/todo.router");

const app = express();
const PORT = 3636;
app.set("trust proxy", 1);

app.use(bodyParser.json());

app.use(express.json());

app.use(express.static(path.join(__dirname, "client")));

app.use("/api", router);
app.get("/", (req, res) => {
  res.sendFile(__dirname, "client", "index.html");
});

app.listen(PORT, () => {
  console.log(`Listening  to the port ${PORT}`);
});
