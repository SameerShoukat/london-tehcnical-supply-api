const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require("../models/users");
const Role = require("../models/roles");
const boom = require("@hapi/boom");
const { message } = require("../utils/hook");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const getOneUser = async (where) => {
   return await User.findOne({
    where: where,
    attributes: { exclude: ['password']},
    include: [{
      model: Role,
      as: 'role',
      attributes: ['name', 'permissions']
    }]
  });
}

const filter = (user) =>{
  const updatedUser = user.toJSON();
  delete updatedUser.role;
  return updatedUser

}

// @desc    Register a new user
// @route   POST /api/users/register
const registerUser = async (req, res, next) => {
  try {
    const { firstName, lastName, roleId, email, password } = req.body;

    // Check if the user exists (including soft-deleted ones)
    const existingUser = await User.findOne({
      paranoid: false,
      where: { email },
    });

    if (existingUser) {
      if (existingUser.deletedAt) {
        // Restore soft-deleted user
        existingUser.restore();
        const token = generateToken(existingUser.id);
        return res.status(201).json(message(true, 'User has been restored successfully', {
          id: existingUser.id,
          firstName: firstName,
          lastName: lastName,
          roleId : roleId,
          email: existingUser.email,
          token,
        }));
      } else {
        throw boom.conflict('A user with this email already exists.');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = await User.create({
      firstName,
      lastName,
      roleId,
      email,
      password: hashedPassword,
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json(message(true, 'User registered successfully', {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token,
    }));
  } catch (error) {
    next(error); // Pass error to global error handler
  }
};


// @desc    Authenticate user & get token
// @route   POST /api/users/login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email}});
    if(!user) throw boom.notFound('User not found');

    console.log(user)

    
    if (!bcrypt.compareSync(password, user.password)) throw boom.unauthorized(`Invalid password`);

      // Generate token
      const token = generateToken(user.id);
      res.status(200).json(message(true, 'Login successful', {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token,
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
    const userId = req.params.id ? req.params.id : req.user.id;
   const user = await getOneUser({id : userId});
    if (!user) {
      throw boom.notFound('User not found');
    }

    // Update fields
    const updatedFields = {
      firstName: req.body.firstName || user.firstName,
      lastName: req.body.lastName || user.lastName,
      roleId: req.body.roleId || user.roleId,
      email: req.body.email || user.email,
      phone: req.body.phone || user.phone,
    };

    // Update password if provided
    if (req.body.password) {
      updatedFields.password = await bcrypt.hash(req.body.password, 10);
    }

    await user.update(updatedFields);

    res.status(200).json(message(true, 'User profile updated successfully', filter(user)));
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {

    const { pagination = 1, limit = 10 } = req.query;
    const offset = (parseInt(pagination, 10) - 1) * parseInt(limit, 10);

    const whereClause = {  };

    // Get the total count of matching rows
    const count = await User.count({ where: whereClause });

    // Get the paginated rows
    const rows = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit, 10),
      offset,
    });


      return res.status(200).json(message(true, 'Roles retrieved successfully', rows, count));

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

        return res.status(200).json(message(true, 'User retrieved successfully', filter(user)));
    } catch (error) {
      next(error);
    }
};

// Update a role by ID


const deleteOne = async (req, res, next) => {
  try {
      const { id } = req.params;

      const user = await getOneUser({id});
      if (!user) throw boom.notFound('User not found');

      if(user?.role?.name === 'admin'){
        throw boom.badRequest('Admin cant be deleted');
      } 

      await user.destroy();

      return res.status(200).json(message(true, 'User deleted successfully'));
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
  deleteOne
};
