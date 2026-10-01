const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    console.log(
      "AUTH HEADER:",
      authHeader ? "RECEIVED" : "MISSING"
    );

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Token Missing",
      });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader;

    console.log("TOKEN LENGTH:", token.length);
    console.log(
      "JWT SECRET LOADED:",
      Boolean(process.env.JWT_SECRET)
    );

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("JWT VALID:", decoded);

    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT ERROR:", error.name, error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};

module.exports = auth;