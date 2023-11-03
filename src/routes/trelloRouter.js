const trelloRouter = require("express").Router();
trelloRouter.get("/", (req, res) => {
  res.send("test1");
});
module.exports = trelloRouter;
