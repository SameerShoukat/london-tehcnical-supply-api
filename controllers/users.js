const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require("../models/users");
const Permission = require("../models/permission");
const Permissions = require("../models/perrmisions");
const boom = require("@hapi/boom");
const { message } = require("../utils/hook");
const {generateRefreshToken, refreshAccessToken, revokeRefreshToken } = require("./refreshtoken")
const {deleteToken} =  require("../middleware/auth")

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const getOneUser = async (where) => {
   return await User.findOne({
    where: where,
    attributes: { exclude: ['password']},
    include: [{
      model: Permission,
      as: 'permission'
    }]
  });
}

const filter = (user) =>{
  const updatedUser = user.toJSON();
  delete updatedUser.permission;
  return updatedUser
}

// @desc    Register a new user
// @route   POST /api/users/register
const registerUser = async (req, res, next) => {
  const transaction = await sequelize.transaction(); // Start a transaction
  try {
    const {
      firstName = '',
      lastName = '',
      role = 'user',
      permissions,
      email,
      password = '1234',
    } = req.body;

    // Check if the user exists (including soft-deleted ones)
    const existingUser = await User.findOne({
      paranoid: false, // Include soft-deleted users
      where: { email },
      transaction,
    });

    // Ensure permissions exist
    const permission = await Permission.create(permissions, { transaction });

    if (existingUser) {
      if (existingUser.deletedAt) {
        // Restore soft-deleted user
        await existingUser.restore({ transaction });
        await existingUser.update(
          {
            firstName,
            lastName,
            role,
            permissionId: permission.id,
            password: await bcrypt.hash(password, 10),
          },
          { transaction }
        );

        // Reload user to ensure updates
        await existingUser.reload({ transaction });

        await transaction.commit(); // Commit the transaction
        return res.status(201).json({
          success: true,
          message: 'User restored successfully',
          data: {
            role: existingUser.role,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            email: existingUser.email
          },
        });
      } else {
        throw boom.conflict('A user with this email already exists.');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = await User.create(
      {
        firstName,
        lastName,
        email,
        role,
        permissionId: permission.id,
        password: hashedPassword,
      },
      { transaction }
    );

    await transaction.commit(); // Commit the transaction
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    await transaction.rollback(); // Rollback the transaction on error
    next(error); // Pass error to global error handler
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/users/login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email, status : true}, 
      include:[{
        model : Permission, 
        as : 'permission', 
        attributes : ['setting', 'stocks', 'purchase', 'orders', 'finance','customer_interaction']
      }]
    });
    if(!user) throw boom.notFound('User not found');
    
    if (!bcrypt.compareSync(password, user.password)) throw boom.unauthorized(`Invalid password`);

    // Generate token
    const token = generateToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);

    res.status(200).json(message(true, 'Login successful', {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      permissions : user.permission,
      authToken : token,
      refreshToken
    }));

  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
const getUserProfile = async (req, res, next) => {
  try {
    const user = await getOneUser({id : req.user.id});
    if (!user) {
      throw boom.notFound('User not found');
    }
    res.status(200).json(message(true, 'User details retrieved successfully', filter(user)));
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.params.id || req.user.id;
    const user = await getOneUser({ id: userId });

    if (!user) {
      throw boom.notFound('User not found');
    }


    // Update permissions if provided
    if (req.body.permissions) {
      const permission = await Permission.findByPk(user.permissionId);
      if (permission) {
        await permission.update(req.body.permissions);
      }
    }

    // Destructure body for cleaner updates
    const { firstName, lastName, email, phone, password } = req.body;

    // Update fields
    const updatedFields = {
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      phone: phone || user.phone,
    };

    // Update password if provided
    if (password) {
      updatedFields.password = await bcrypt.hash(password, 10);
    }

    await user.update(updatedFields);

    res.status(200).json(message(true, 'User profile updated successfully', filter(user)));
  } catch (error) {
    next(error);
  }
};

// Assume User and Permission models are already imported

const getAll = async (req, res, next) => {
  try {

    const { offset = 0, pageSize = 10 } = req.query;

    // count
    const count = await User.count();

    // Get the paginated rows
    const rows = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(pageSize, 10),
      offset,
    });


    return res.status(200).json(message(true, 'Users retrieved successfully', rows, count))
  } catch (error) {
    next(error);
  }
};



// Get a single role by ID
const getOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await getOneUser({id});

        if (!user) throw boom.notFound('User not found');

        return res.status(200).json(message(true, 'User retrieved successfully', user));
    } catch (error) {
      next(error);
    }
};

const deleteOne = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    
    const user = await getOneUser({ id });
    console.log(user)
    if (!user) throw boom.notFound('User not found');

    if (user.role === 'admin') {
      throw boom.badRequest('Admin user cannot be deleted');
    }

    // Delete associated permission
    await Permission.destroy({
      where: { id: user.permissionId },
      transaction
    });

    // Delete the user
    await User.destroy({
      where: { id },
      transaction
    });

    await transaction.commit();
    return res.status(200).json(message(true, 'User deleted successfully'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const validateAccessToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    const response =  await refreshAccessToken(token)
    return res.status(200).json({authToken  : response}); 
} catch (error) {
  next(error);
}
};

const logout = async (req, res, next) => {
  try {
    const { token } = req.body;
    const response =  await revokeRefreshToken(token)
    return res.status(200).json(message(true, 'User log out')); 
} catch (error) {
  next(error);
}
};

// @desc    Activate a user by ID
// @route   PUT /api/users/:id/activate
const activateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await getOneUser({ id });

    if (!user) throw boom.notFound('User not found');
    

    await user.update({ status: true });
    
    deleteToken(id)

    return res.status(200).json(message(true, 'User activated successfully', filter(user)));
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate a user by ID
// @route   PUT /api/users/:id/deactivate
const deactivateUser = async (req, res, next) => {
  try {

    const { id } = req.params;
    const user = await getOneUser({ id });

    if (!user) throw boom.notFound('User not found');
    if(user?.role === 'admin') throw boom.badRequest("Admin status cant be change")

    await user.update({ status: false });

    deleteToken(id)

    return res.status(200).json(message(true, 'User deactivated successfully', filter(user)));
  } catch (error) {
    next(error);
  }
};


const getMyPermission = async (req, res, next) => {
  try {

    const { permission } = req.user;

    return res.status(200).json(message(true, 'User Permission retrieved successfully', permission));
  } catch (error) {
    next(error);
  }
};




module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAll,
  getOne,
  validateAccessToken,
  deleteOne,
  logout,
  activateUser,
  deactivateUser,
  getMyPermission
};
