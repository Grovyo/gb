const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");

//import routes
const userAuth = require("./models/userAuth");

dotenv.config();

//middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors());
app.use("/api", userAuth);

//connect to DB
const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    mongoose.connect(process.env.DATABASE).then(() => {
      console.log("DB is connected");
    });
  } catch (err) {
    console.log(err);
  }
};
connectDB();

//connect to App

const PORT = 7700;

const connectApp = () => {
  try {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};
connectApp();