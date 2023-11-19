const http = require('http');
const express = require('express')
var bodyParser = require('body-parser')

const hostname = '127.0.0.1';
const Sequelize = require("sequelize");
const port = 3000;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
// sequelize.sync({force: true});
const questionRoutes = require("./routes/questionRoutes");
app.get("/", (req, res) => {
    return res.json("server is running")
})
app.use("/api/question", questionRoutes);
app.listen(port, () => console.log(`Example app listening on port ${port}!`))