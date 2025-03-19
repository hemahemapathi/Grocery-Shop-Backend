import sendError from "../utils/sendError.js";

const isAuthorized = async (req, res, next) => {
  if (req.user && req.user.role === "admin")  {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Not Authorized User"
    });
    sendError(res, 400, "Not Authorized User");
  }
};

export default isAuthorized;
