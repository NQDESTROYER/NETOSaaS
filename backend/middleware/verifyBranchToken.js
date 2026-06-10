const jwt = require('jsonwebtoken');

const verifyBranchToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Acceso no autorizado" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.branch = decoded; // Inyecta { branch_id, profile_id, role }
    next();
  } catch (err) {
    res.status(403).json({ error: "Token inválido" });
  }
};

module.exports = verifyBranchToken;
