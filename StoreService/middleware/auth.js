const jwt = require("jsonwebtoken");

const prisma = require("../prismaClient");

const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) return res.status(403).json({ error: "Forbidden " });
    const dbUser = await prisma.user.findUnique({
      where: { phone: user.phone },
    });
    if (!dbUser) {
      return res.status(403).json({ error: "Forbidden " });
    }
    req.role = dbUser.role;
    req.user = dbUser;
    next();
  });
};


const isAdmin = (req, res, next) => {
  if (req.role === "ADMIN") return next();
  return res.status(403).send("Unuthorized");
};
module.exports = { authenticateJWT, isAdmin };
