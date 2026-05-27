const { default: Ajv } = require("ajv");
const prisma = require("../prismaClient");
const bcrypt = require("bcryptjs");

const ajv = new Ajv();
const addFormats = require("ajv-formats");
addFormats(ajv);

const userSchema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1 },
    email: { type: "string", format: "email", nullable: true },
    phone: { type: "string", nullable: true },
    country: { type: "string", nullable: true },
    password: { type: "string", nullable: true },
    website: { type: "string", format: "uri", nullable: true },
    dateOfBirth: { type: "string", format: "date-time", nullable: true },
    taxVatNumber: { type: "string", nullable: true },
    gender: { type: "string", enum: ["Male", "Female", "Other"], nullable: true },
    creditBalance: { type: "number", nullable: true }
  },
  additionalProperties: false,
};

const validate = ajv.compile(userSchema);

const buildFilterQuery = (filters) => {
  const query = {};
  for (const key in filters) {
    if (filters[key]) {
      query[key] = { contains: filters[key], mode: "insensitive" };
    }
  }
  return query;
};

// Get all users with filtering
const getUsers = async (req, res) => {
  try {
    const { offset = 0, limit = 10, ...filters } = req.query;

    const where = buildFilterQuery(filters);
    const parsedOffset = parseInt(offset, 10) || 0;
    const parsedLimit = parseInt(limit, 10) || 10;

    const users = await prisma.user.findMany({
      skip: parsedOffset,
      take: parsedLimit,
      where,
      include: { Address: true },
    });
    const total = await prisma.user.count({ where });

    res.status(200).json({
      users,
      pageDetails: {
        total,
        offset: parsedOffset,
        limit: parsedLimit,
        currentPage: Math.floor(parsedOffset / parsedLimit) + 1,
        totalPages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new user
const createUser = async (req, res) => {
  let data = req.body;

  if (!validate(data)) {
    return res.status(400).json({ errors: validate.errors });
  }

  try {
    // Hash the password before saving
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }

    const user = await prisma.user.create({ data });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update user by ID
const updateUser = async (req, res) => {
  const { id } = req.params;
  let data = req.body;

  // Prevent updates to critical fields
  delete data.id;
  delete data.email;
  delete data.role;

  if (!validate(data)) {
    return res.status(400).json({ errors: validate.errors });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data,
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update personal information for logged-in user
const updatePersonalInformation = async (req, res) => {
  const { id } = req.user;
  let data = req.body;

  if (!data.password) {
    return res.status(400).json({ error: "Current password is required" });
  }

  // Verify current password
  const isMatch = await bcrypt.compare(data.password, req.user.password);
  if (!isMatch) {
    return res.status(400).json({ error: "Current password is incorrect" });
  }

  // Hash new password if provided
  if (data.newPassword) {
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.newPassword, salt);
  }
  
  delete data.newPassword;
  delete data.confirmPassword;

  if (!validate(data)) {
    return res.status(400).json({ errors: validate.errors });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        name: true,
        email: true,
        phone: true,
      },
    });    
    res.status(200).json(user);
  } catch (error) {
    console.log('error', error);
    
    res.status(400).json({ error: error.message });
  }
};

const updateUserPass = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: {
        email,
      },
      data: {
        password: hashedPassword,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  const { id } = req.params;

  let userId = id;

  try {
    let user;
    if (id === "user") {
      userId=req?.user?.id;
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          phone: true,
          // orders: {
          //   include: {
          //     products: true,
          //   },
          // },
        },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { id:userId },
        include: {
          orders: { include: { products: true } },
        },
      });
    }
    
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Ensure user exists before deleting
    const userExists = await prisma.user.findUnique({ where: { id } });
    if (!userExists) return res.status(404).json({ error: "User not found" });

    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updatePersonalInformation,
  updateUserPass,
  deleteUser,
};
