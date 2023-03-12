const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const http = require("http").Server(app);
const io = require("socket.io")(http);

//import routes
const userAuth = require("./routes/authRoutes");
const chatRoutes = require("./routes/convRoutes");
const messageRoutes = require("./routes/message");
const communityRoutes = require("./routes/community");
const topicRoutes = require("./routes/topic");
const productRoutes = require("./routes/product");
const postRoutes = require("./routes/post");
const prositeRoutes = require("./routes/prosite");
const commentRoutes = require("./routes/comment");
const reviewRoutes = require("./routes/review");
const orderRoutes = require("./routes/order");
const glimpseRoutes = require("./routes/glimpse");
const replyRoutes = require("./routes/reply");

require("dotenv").config();

//middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/api", userAuth);
app.use("/api", chatRoutes);
app.use("/api", messageRoutes);
app.use("/api", communityRoutes);
app.use("/api", topicRoutes);
app.use("/api", productRoutes);
app.use("/api", postRoutes);
app.use("/api", prositeRoutes);
app.use("/api", commentRoutes);
app.use("/api", reviewRoutes);
app.use("/api", orderRoutes);
app.use("/api", glimpseRoutes);
app.use("/api", replyRoutes);

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

//socket.io
io.on("connection", function (socket) {
  console.log("a user connected");

  socket.on("chatmessage", function (msg) {
    io.emit("message", msg);
    console.log("back: " + msg);
  });

  socket.on("disconnect", function () {
    console.log("user disconnected");
  });
});

http.listen(3000, function () {
  console.log("Sockets on *:3000");
});
