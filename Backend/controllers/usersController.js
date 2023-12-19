const User = require("../model/User");
const jwt = require("jsonwebtoken");

const getAllUsers = async (req, res) => {
  const users = await User.find();
  if (!users) return res.status(204).json({ message: "No users found" });
  res.json(users);
};

const deleteUser = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "User ID required" });
  const user = await User.findOne({ _id: req.params.id }).exec();
  if (!user) {
    return res
      .status(204)
      .json({ message: `User ID ${req.params.id} not found` });
  }
  const result = await user.deleteOne({ _id: req.params.id });
  res.json(result);
};

const getUser = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "User ID required" });
  const user = await User.findOne({ _id: req.params.id }).exec();
  if (!user) {
    return res
      .status(204)
      .json({ message: `User ID ${req.params.id} not found` });
  }
  res.json(user);
};

const isValidEmail = async (req, res) => {
  if (!req?.params?.email)
    return res.status(400).json({ message: "no email address provided" });
  const user = await User.findOne({ email: req.params.email }).exec();
  if (!user) {
    return res.status(200).json({ message: false });
  }
  return res.status(200).json({ message: true });
};

const getMe = async (req, res) => {
  const accessToken = req.cookies.jwt;
  if (!accessToken) {
    return res.status(401).json({ message: "Access token is required" });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const userEmail = decoded.UserInfo.email;

    const user = await User.findOne({ email: userEmail }).exec();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired access token" });
  }
};

module.exports = {
  isValidEmail,
  getAllUsers,
  deleteUser,
  getUser,
};
