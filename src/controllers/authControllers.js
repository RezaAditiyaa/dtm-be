const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const keyAccessToken = process.env.JWT_ACCESS_KEY;
const keyRefreshToken = process.env.JWT_REFRESH_KEY;
const accessTokenExpire = process.env.JWT_ACCESS_EXPIRE_IN;
const refreshTokenExpire = process.env.JWT_REFRESH_EXPIRE_IN;

let refreshTokens = [];
const authController = {
  //REGISTER
  registerUser: async (req, res) => {
    try {
      //bcrypt
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(req.body.password, salt);

      //Create new user
      const newUser = await new User({
        email: req.body.email,
        username: req.body.username,
        password: hashed,
        phone: req.body.phone,
        board: {
          id: `board-${Date.now()}`,
          columnOrder: [],
          columns: [],
        },
      });

      //Save to DB
      const user = await newUser.save();
      res.status(200).json({
        EC: 0,
        data: user,
      });
    } catch (error) {
      console.log("errer register>> ", error);
      res.status(500).json({
        EC: -2,
        data: error,
      });
    }
  },

  //GENERATE ACCESS TOKEN
  generateAccessToken: (user) => {
    return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, keyAccessToken, {
      expiresIn: accessTokenExpire,
    });
  },

  //GENERATE REFRESH TOKEN
  generateRefreshToken: (user) => {
    return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, keyRefreshToken, {
      expiresIn: refreshTokenExpire,
    });
  },

  // LOGIN
  loginUser: async (req, res) => {
    console.log("req", req);
    try {
      const user = await User.findOne({ email: req.body.email });

      //Kiểm tra xác thực email
      if (!user) {
        return res.status(404).json({
          EC: -1,
          data: "Thông tin đăng nhập không đúng",
        });
      }

      //Kiểm tra xác thực pasword
      const validatePassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validatePassword) {
        return res.status(404).json({
          EC: -1,
          data: "Thông tin đăng nhập không đúng",
        });
      }

      //Trùng email và password
      if (user && validatePassword) {
        const accessToken = authController.generateAccessToken(user);
        const refreshToken = authController.generateRefreshToken(user);

        refreshTokens.push(refreshToken);

        //Loaị bỏ password khi login
        const { password, ...others } = user._doc;

        const userWP = { ...others };
        res.status(200).json({
          EC: 0,
          data: { userWP, accessToken, refreshToken },
        });
      }
    } catch (error) {
      res.status(500).json({
        EC: -2,
        data: req,
      });
    }
  },

  //TEST REFRESH TOKEN
  requestRefreshToken: async (req, res) => {
    if (req.body.refreshLocal === null) {
      console.log("refreshLocal null >>> ko co refresh token trong local S");
      return res
        .status(200)
        .json({ EC: 1, data: "không có refresh token trong LS" });
    }
    const refreshToken = req.body.refreshLocal;
    jwt.verify(refreshToken, keyRefreshToken, (err, user) => {
      if (err) {
        console.log("refresh token het han");
        return res.status(400).json({ EC: -2, data: "Refresh Token hết hạn" });
      }
      refreshTokens = refreshTokens.filter((token) => token != refreshToken);

      //create new access and refresh Token
      const newAccessToken = authController.generateAccessToken(user);
      const newRefreshToken = authController.generateRefreshToken(user);

      refreshTokens.push(newRefreshToken);

      res.status(201).json({
        EC: 0,
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });
    });
  },

  //LOGOUT
  logoutUser: async (req, res) => {
    // refreshTokens = refreshTokens.filter(
    //   (token) => token !== req.headers.cookie.split("=")[1]
    // );
    // res.clearCookie("refreshToken");
    return res.status(200).json({
      EC: 0,
      data: { EC: 0, data: "Logout successfully" },
    });
  },

  //FETCH ACCOUNT
  fetchAccount: async (req, res) => {
    try {
      const userFullInfor = await User.findById(req.user.id);
      // .populate({
      //   path: "listCart",
      //   populate: {
      //     path: "productId",
      //     model: "product",
      //   },
      // });
      const { password, ...others } = userFullInfor._doc;
      const user = { ...others };
      res.status(200).json({
        EC: 0,
        data: { user },
      });
    } catch (error) {
      res.status(500).json({
        EC: -2,
        data: error,
      });
    }
  },

  //EDIT BOARD
  editBoard: async (req, res) => {
    let boardLS;
    let userId = req.body.UserId;
    let categoryName = req.params.name;
    switch (categoryName) {
      case "addCard":
        boardLS = req.body.newCard.board;
        break;
      case "addColumn":
        boardLS = req.body.newColumn.board;
        break;
      case "deleteCard":
        boardLS = req.body.idCard.board;
        break;
      case "deleteColumn":
        boardLS = req.body.idColumn.board;
        break;
      case "editTitle":
        boardLS = req.body.edit.board;
        break;
      case "swag":
        boardLS = req.body.swagInfor.board;
        break;
    }

    let user = await User.findById(userId);
    if (user) {
      user.board = boardLS;
    }
    let new_user = await user.save();
    console.log("new_user>>>", new_user);
    try {
      res.status(200).json({
        EC: 0,
        data: new_user,
      });
    } catch (error) {
      res.status(500).json({
        EC: 1,
        data: error,
      });
    }
  },
};

module.exports = authController;
