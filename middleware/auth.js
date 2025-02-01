const jwt = require('jsonwebtoken');
const User = require('../models/users');
const Role = require('../models/roles');
const { promisify } = require('util');

const verifyToken = promisify(jwt.verify);
const tokenCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const JWT_SECRET = process.env.JWT_SECRET;



const getUserFromCache = (cacheKey) => tokenCache.get(cacheKey);

const fetchUserFromDB = async (decoded) => {
  return await User.findByPk(decoded.id, {
    attributes: { exclude: ['password'] },
    include: [{
      model: Role,
      as: 'role',
      attributes: ['name', 'permissions']
    }]
  });
};

const handleJWTError = (error, res) => {
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }
  return res.status(500).json({ message: 'Internal server error' });
};

const handleAuthorization = (req, res, next, module, action, allow) => {
  const { user } = req;

  if (user.role.name === 'admin' || allow === true) {
    return next();
  }

  const permissions = user.role?.permissions?.[module];

  if (!permissions) {
    return res.status(403).json({ 
      message: `No permissions for module: ${module}` 
    });
  }

  if (!permissions.includes(action)) {
    return res.status(403).json({ 
      message: `Action '${action}' not allowed for module: ${module}` 
    });
  }

  return next();
};

const authorize = (module, action, allow) => {
  return async (req, res, next) => {
    try {


      const authHeader = req?.headers?.authorization;
      if (!authHeader || !authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = await verifyToken(token, JWT_SECRET);
      
      if (!decoded || !decoded.id) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const cacheKey = decoded.id;
      const cachedUser = getUserFromCache(cacheKey);
      if (cachedUser) {
        req.user = cachedUser.toJSON();
        return handleAuthorization(req, res, next, module, action, allow);
      }

  
      const userInfo = await fetchUserFromDB(decoded);

      if (!userInfo) {
        return res.status(401).json({ message: 'User not found' });
      }

      tokenCache.set(cacheKey, userInfo);
      setTimeout(() => tokenCache.delete(cacheKey), CACHE_TTL);

      req.user = userInfo.toJSON();
      return handleAuthorization(req, res, next, module, action, allow);

    } catch (error) {
      console.error('Authorization error:', error);
      return handleJWTError(error, res);
    }
  };
};

module.exports = { authorize };