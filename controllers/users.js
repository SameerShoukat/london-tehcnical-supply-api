const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require("../models/users");
const boom = require("@hapi/boom");
const { message } = require("../utils/hook");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/users/register
const registerUser = async (req, res, next) => {
  try {
    console.log(req.body)
    const { firstName, lastName, roleId, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      throw boom.conflict('User already exists');
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
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
    next(error); // Pass error to the global error handler
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/users/login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if(!user) throw boom.notFound('User not found');
    
    // if (!bcrypt.compareSync(password, user.password)) throw boom.unauthorized(`Invalid password`);

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
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      throw boom.notFound('User not found');
    }

    res.status(200).json(message(true, 'User details retrieved successfully', user));
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

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

    res.status(200).json(message(true, 'User profile updated successfully', {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone : user.phone
    }));
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {

    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const whereClause = { deletedAt: null };

    // Get the total count of matching rows
    const count = await User.count({ where: whereClause });

    // Get the paginated rows
    const rows = await User.findAll({
      where: whereClause,
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
        const user = await User.findOne({id:id, deletedAt: null});

        if (!user) throw boom.notFound(message(false, 'User not found'));

        return res.status(200).json(message(true, 'User retrieved successfully', user));
    } catch (error) {
      next(error);
    }
};

// Update a role by ID
const updateOne = async (req, res, next) => {
  try {

    const { id } = req.params;
    const updateData = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      throw boom.notFound('User not found');
    }

    // Update fields
    const updatedFields = {
      firstName: updateData.firstName || user.firstName,
      lastName: updateData.lastName || user.lastName,
      roleId: updateData.roleId || user.roleId,
      email: updateData.email || user.email,
      phone: updateData.phone || user.phone,
    };

    // Update password if provided
    if (updateData.password) {
      updatedFields.password = await bcrypt.hash(updateData.password, 10);
    }

    await User.update(updatedFields);

    res.status(200).json(message(true, 'User profile updated successfully', {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone : user.phone
    }));
  } catch (error) {
    next(error);
  }
};


const deleteOne = async (req, res, next) => {
  try {
      const { id } = req.params;
      const user = await User.findByPk(id);

      if (!user) {
          throw boom.notFound(message.notFound('User'));
      }

      await user.update({ deletedAt: new Date() });

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
  updateOne,
  deleteOne
};
