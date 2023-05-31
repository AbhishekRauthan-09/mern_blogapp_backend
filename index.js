const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const Route = require("./Routes/Route");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config({path:'./.env'})
const conn = require("./Database/conn");

const corsOptions = {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
    credentials:true,
};

app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));
app.use(Route);
app.use('/uploads' , express.static(__dirname + '/uploads'));

app.listen(port, () => {
  console.log("app listening on port " + port);
});
