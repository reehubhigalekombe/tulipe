import jwt from "jsonwebtoken"
const authMiddleware =  (req, res, next) => {
try {
    const authHeader = req.headers.authorization;
    if(!authHeader) {
        return res.status(401).json({
            message: "Authentication token Missing"
        });
    }
    const token = authHeader.split("")[1];
    if(!token) {
        return res.status(501).json({
            message: "Authentication token is missing"
        })
    }
    const decoded = jwt.verify(
        token, process.env.JWT_SECRET
    );

    req.merchant = decoded.merchantId;
    next();

}catch(error) {
    console.error("JWT authentication error: ", error.message);
      return res.status(401).json({
            message: "Invalid or the JWT authentication expired"
        });

}
}

export default  authMiddleware