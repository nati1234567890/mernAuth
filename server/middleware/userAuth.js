import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.json({
      success: false,
      message: "not authorized login again one",
    });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (decodedToken.id) {
      req.body.userId = decodedToken.id;
    } else {
      return res.json({
        success: false,
        message: "not authorized login again two",
      });
    }
    next();
  } catch (error) {
    return res.json({
      success: false,
      message: "haha",
    });
  }
};
export default userAuth;
