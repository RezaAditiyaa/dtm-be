require("dotenv").config();
const cors = require("cors");
const express = require("express");
const trelloRouter = require("./src/routes/trelloRouter");
const connection = require("./src/config/database");
const authRouter = require("./src/routes/auth");
const app = express();

//env
const port = process.env.PORT;
const hostname = process.env.HOST_NAME;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Khai báo routes khi vercel
app.get("/", (req, res) => {
  res.send("test");
});
app.use("/v1/api/auth", authRouter);

// ROUTES

app.use("/v1/api/trello", trelloRouter);

// Connect to DB
(async () => {
  try {
    await connection();
    app.listen(port, hostname, () => {
      console.log(`backend zero app listening on port ${port}`);
    });
  } catch (error) {
    console.log("error connect to DB>>> ", error);
  }
})();
