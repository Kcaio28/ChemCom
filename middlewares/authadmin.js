export const adminOnly = (req, res, next) => {
  if (req.user && req.user.tipo === 'admin') {
    return next();
  }
  return res.status(403).json({ erro: 'Acesso restrito a administradores' });
};
