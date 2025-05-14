const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Account = require("../models/order-and-sale/account");
const boom = require("@hapi/boom");
const {message } = require("../utils/hook");
const {generateRefreshToken, refreshAccessToken, revokeRefreshToken } = require("./refreshtoken")
const {deleteToken} =  require("../middleware/auth")

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const getOneAccount = async (where) => {
   return await Account.findOne({
    where: where,
    attributes: { exclude: ['password']},
  });
}


// @desc    Register a new user
// @route   POST /api/users/register
const registerUser = async (req, res, next) => {
  const transaction = await sequelize.transaction(); // Start a transaction
  try {
    const {
      email = '',
      password = '',
    } = req.body;

    // Check if the user exists (including soft-deleted ones)
    const existingUser = await Account.findOne({
      paranoid: false, // Include soft-deleted users
      where: { email },
      transaction,
    });


    if (existingUser) {
      if (existingUser.deletedAt) {
        // Restore soft-deleted user
        await existingUser.restore({ transaction });
        await existingUser.update(
          {
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
            email: existingUser.email
          },
        });
      } else {
        throw boom.conflict('A user with this email already exists.');
      }
    }


    // Create a new user
    const user = await Account.create(
      {
        email,
        password: await bcrypt.hash(password, 10),
      },
      { transaction }
    );

    await transaction.commit(); // Commit the transaction
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        email: user.email,
      },
    });
  } catch (error) {
    await transaction.rollback(); 
    next(error); 
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/users/login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const account = await Account.findOne({where: { email, status : true}});
    if(!account) throw boom.notFound('Account not found');
    
    if (!bcrypt.compareSync(password, account.password)) throw boom.unauthorized(`Invalid password`);

    // Generate token
    const token = generateToken(account.id);
    const refreshToken = await generateRefreshToken(account.id);

    res.status(200).json(message(true, 'Login successful', {
      id: account.id,
      email: user.email,
      role : user.role,
      permissions : user.permission,
      authToken : token,
      refreshToken
    }));

  } catch (error) {
    next(error);
  }
};

// get all accounts
const getAll = async (req, res, next) => {
  try {

    const { offset = 0, pageSize = 10 } = req.query;

    const count = await Account.count();
    const rows = await Account.findAll({
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
        const user = await getOneAccount({id});

        if (!user) throw boom.notFound('Account not found');

        return res.status(200).json(message(true, 'Account retrieved successfully', filter(user)));
    } catch (error) {
      next(error);
    }
};

// Update a role by ID
const deleteOne = async (req, res, next) => {
  try {

      const { id } = req.params;

      const account = await getOneAccount({id});
      if (!account) throw boom.notFound('User not found');

      await account.destroy();

      return res.status(200).json(message(true, 'User deleted successfully'));
  } catch (error) {
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
    const account = await getOneAccount({ id });

    if (!account) throw boom.notFound('Account not found');
    

    await account.update({ status: true });
    
    deleteToken(id)

    return res.status(200).json(message(true, 'Account activated successfully', filter(account)));
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate a user by ID
// @route   PUT /api/users/:id/deactivate
const deactivateUser = async (req, res, next) => {
  try {

    const { id } = req.params;
    const account = await getOneAccount({ id });

    if (!account) throw boom.notFound('Account not found');

    await account.update({ status: false });

    deleteToken(id)

    return res.status(200).json(message(true, 'Account deactivated successfully', filter(account)));
  } catch (error) {
    next(error);
  }
};




module.exports = {
  registerUser,
  loginUser,
  getAll,
  getOne,
  validateAccessToken,
  deleteOne,
  logout,
  activateUser,
  deactivateUser,
};
