const jwt =
  require("jsonwebtoken");

function requireAuth(
  req,
  res,
  next
) {

  console.log(req.headers)
  const authHeader =
    req.headers.authorization;

  if (!authHeader) {

    return res
      .status(401)
      .json({
        error:
          "Missing token"
      });

  }

  const token =
    authHeader.replace(
      "Bearer ",
      ""
    );

  try {

    req.user =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    next();

  }
  catch (error) {

    return res
      .status(401)
      .json({
        error:
          "Invalid token"
      });

  }

}

module.exports =
  requireAuth;
