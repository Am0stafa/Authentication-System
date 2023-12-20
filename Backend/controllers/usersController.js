const User = require("../model/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

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

// {
//   "email": "abdo@gmail.com",
//   "newRole": "Admin"
// }
const changeUserRole = async (req, res) => {
  const { email, newRole } = req.body;
  if (!userId || !newRole) {
    return res
      .status(400)
      .json({ message: "User ID and new role are required" });
  }

  try {
    const user = await User.findOne({ email }).exec();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Assuming newRole is the key from the roles object (e.g., "Admin", "Editor", "User")
    const roles = require("../config/rolesList");
    if (roles[newRole] === undefined) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Update the user's role
    user.roles[newRole] = roles[newRole];
    await user.save();

    res.status(200).json({ message: `User role updated to ${newRole}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserDetails = async (req, res) => {
  const { refreshToken } = req.params;
  const { email, name, password } = req.body;

  if (!refreshToken)
    return res.status(400).json({ message: "User refreshToken required" });

  try {
    const user = await User.findOne({ refreshToken }).exec();
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email) user.email = email;
    if (name) user.name = name;
    if (password) {
      // user.password = hashPassword(password);
      if (password.length < 8 || password.length > 24) {
        return res.status(400).json({
          status: "failed",
          message: "Password must be between 8 and 24 characters",
        });
      }

      const PWD_REGEX =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
      if (!PWD_REGEX.test(password))
        return res.status(404).json({
          status: "failed",
          message:
            "Must include uppercase and lowercase letters, a number and a special character",
        });
      const salt = process.env.SALT;
      const peppers = ["00", "01", "10", "11"];
      const pepper = peppers[Math.floor(Math.random() * 4)];
      const pwd = crypto
        .createHash("sha512")
        .update(salt + pwd + pepper)
        .digest("hex");
      user.password = pwd;
    }

    await user.save();
    res.status(200).json({ message: "User details updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  isValidEmail,
  getAllUsers,
  deleteUser,
  getUser,
  getMe,
  changeUserRole,
  updateUserDetails
};
