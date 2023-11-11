const jwt = require("jsonwebtoken");
require("dotenv").config();
const keyAccessToken = process.env.JWT_ACCESS_KEY;

const middlewareControllers = {
  verifyToken: (req, res, next) => {
    const token = req.headers["authorization"];
    const accessToken = token.split(" ")[1];
    if (accessToken) {
      jwt.verify(accessToken, keyAccessToken, (err, user) => {
        if (err) {
          res
            .status(401)
            .json("Token đã hết hạn cần Refresh Token hoặc = null");
          return;
        }
        req.user = user;
        console.log("user>>> ", user);
        next();
      });
    } else {
      res.status(403).json("Không thấy có Token");
      return;
    }
  },

  //Xác thực token và kiểm tra tài khoản là user hay admin
  verifyTokenAndAuthorization: (req, res, next) => {
    middlewareControllers.verifyToken(req, res, () => {
      if (req.user.id == req.params.id || req.user.isAdmin) {
        next();
      } else {
        res.status(403).json("You are not alowed to do that!");
      }
    });
  },

  // Xác thực token và Admin
  verifyTokenAndAdmin: (req, res, next) => {
    middlewareControllers.verifyToken(req, res, () => {
      if (req.user.isAdmin) {
        next();
      } else {
        res.status(403).json("You are not alowed to do that!");
      }
    });
  },
};

module.exports = middlewareControllers;
