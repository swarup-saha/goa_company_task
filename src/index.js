const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const { MONGODB_URI } = require("./config");
const { API_ENDPOINT_NOT_FOUND_ERR, SERVER_ERR } = require("./errors");

// routes
const authRoutes = require("./routes/auth");

// init express app
const app = express();

// middlewares

app.use(express.json());
app.use(cors());

// log in development environment

// if (NODE_ENV === "development") {
//   const morgan = require("morgan");
//   app.use(morgan("dev"));
// }

// index route

app.get("/", (req, res) => {
  res.status(200).json({
    type: "success",
    message: "server is up and running",
    data: null,
  });
});

// routes middlewares

app.use("/api/auth", authRoutes);

// page not found error handling  middleware

app.use("*", (req, res, next) => {
  const error = {
    status: 404,
    message: API_ENDPOINT_NOT_FOUND_ERR,
  };
  next(error);
});

// global error handling middleware
app.use((err, req, res, next) => {
  console.log(err);
  const status = err.status || 500;
  const message = err.message || SERVER_ERR;
  const data = err.data || null;
  res.status(status).json({
    type: "error",
    message,
    data,
  });
});

async function main() {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("database connected");

    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server listening on port`)
    );
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

main();
