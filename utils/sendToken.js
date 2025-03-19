import jwt from "jsonwebtoken";

const sendToken = async (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "30d",
  });
};

export const sendCookie = async (res, statusCode, token, user, message) => {
  const options = {
    httpOnly: true,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  };

  res.cookie("token", token, options).status(statusCode).json({
    success: true,
    message,
    user,
    token
  });
};

export default { sendToken, sendCookie };