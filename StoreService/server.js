const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const authenticationRoutes = require("./routes/index"); // Replace with the actual path to your file
var cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const bcrypt = require("bcryptjs");

const prisma = require("./prismaClient");

process.on("SIGINT", async () => {
  console.log("Disconnecting Prisma Client...");
  await prisma.$disconnect();
  process.exit(0);
});

const createAdminUser = async () => {
  try {
    // Check if an admin user already exists
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });
    console.log(adminUser);

    if (!adminUser) {
      // Hash the default admin password
      const defaultAdminPassword =
        process.env.DEFAULT_ADMIN_PASSWORD || "admin123";
      const hashedPassword = await bcrypt.hash(defaultAdminPassword, 10);

      // Create the admin user
      await prisma.user.create({
        data: {
          name: "Admin User",
          email: "admin@example.com",
          phone: "1234567890",
          password: hashedPassword,
          role: "ADMIN",
          confirmedEmail: true,
        },
      });

      console.log("Admin user created successfully.");
    } else {
      console.log("Admin user already exists.");
    }
  } catch (error) {
    console.error("Error creating admin user:", error.message);
  } finally {
    await prisma.$disconnect();
  }
};

// createAdminUser();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    // allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Middleware
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use("/api", authenticationRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
