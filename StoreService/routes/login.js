// Routes: Authentication, Category, and Product Operations

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const Ajv = require("ajv");
const AWS = require("aws-sdk");
const bcrypt = require("bcryptjs");
const router = express.Router();
const nodemailer = require("nodemailer");

const prisma = new PrismaClient();
const ajv = new Ajv();
const addFormats = require("ajv-formats");
addFormats(ajv);

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const sns = new AWS.SNS();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASS,
  },
});

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, phone: user.phone, role: user.role },
    process.env.JWT_SECRET,
  );
};

// Send OTP via AWS SNS
const sendOtp = async (phone, otp) => {
  const params = {
    Message: `Your SAAB Store OTP is ${otp}`,
    PhoneNumber: phone,
  };
  await sns.publish(params).promise();
  return otp;
};

// Send OTP to EMAIL
const sendEmailOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: email,
    subject: "Your OTP for Wedding Touch by Saadgi",
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://www.weddingtouchbysaadgi.com/assets/logo1.png" alt="Wedding Touch by Saadgi" style="width: 150px;"/>
          </div>
          <h2 style="color: #bb0100; text-align: center;">Your OTP Code</h2>
          <p style="font-size: 16px; color: #333; text-align: center;">
            Thank you for choosing <strong>Wedding Touch by Saadgi</strong>. To continue with your secure transaction, please use the OTP below:
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #bb0100; padding: 10px 20px; border: 1px dashed #bb0100; border-radius: 8px;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 14px; color: #555; text-align: center;">
            This OTP is valid for the next <strong>5 minutes</strong>. Please do not share it with anyone for security reasons.
          </p>
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">
            Need help? Contact us at <a href="mailto:support@saadgi.com" style="color: #bb0100; text-decoration: none;">support@saadgi.com</a>.
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  return otp;
};


// Validation Schemas
const phoneAuthSchema = {
  type: "object",
  properties: {
    phone: { type: "string" },
  },
  required: ["phone"],
};

const verifyOtpSchema = {
  type: "object",
  properties: {
    phone: { type: "string" },
    email: { type: "string", format: "email" },
    otp: { type: "string", minLength: 6, maxLength: 6 },
  },
  allOf: [
    {
      anyOf: [
        { required: ["phone"] },
        { required: ["email"] },
      ],
    },
    { required: ["otp"] },
  ],
};

const registerSchema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1 },
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 6 },
  },
  required: ["name", "email", "password"],
};

const reOTPSchema = {
  type: "object",
  properties: {
    phone: { type: "string" },
    email: { type: "string", format: "email" },
  },
  anyOf: [
    { required: ["phone"] },
    { required: ["email"] },
  ],
};

const loginSchema = {
  type: "object",
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 6 },
  },
  required: ["email", "password"],
};

const validate = (schema) => (req, res, next) => {
  const validate = ajv.compile(schema);
  const valid = validate(req.body);
  if (!valid) return res.status(400).json({ errors: validate.errors });
  next();
};

// Login or Register with Phone Number
router.post("/phone", validate(phoneAuthSchema), async (req, res) => {
  const { phone } = req.body;

  try {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Upsert the user: if the user exists, update; otherwise, create a new one
    const user = await prisma.user.upsert({
      where: { phone },
      update: {
        otp,
        otpExpiry: new Date(Date.now() + 5 * 60 * 1000), // OTP expires in 5 minutes
      },
      create: {
        phone,
        otp,
        otpExpiry: new Date(Date.now() + 5 * 60 * 1000),
        name: "NEW USER",
        role: "USER", // Default role for new users
      },
    });

    // Send OTP to the user's phone (replace this with the actual OTP sending logic)
    await sendOtp(phone, otp);

    res.status(200).json({ message: "OTP sent successfully", userId: user.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// router.post("/verify-otp", validate(verifyOtpSchema), async (req, res) => {
//   const { phone, otp } = req.body;
//   try {
//     const user = await prisma.user.findUnique({ where: { phone } });

//     if (!user || user.otp !== otp || new Date() > new Date(user.otpExpiry)) {
//       return res.status(400).json({ error: "Invalid or expired OTP" });
//     }

//     await prisma.user.update({
//       where: { phone },
//       data: { otp: null, otpExpiry: null, confirmedPhone: true },
//     });

//     const token = generateToken(user);
//     res.status(200).json({ token });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// Register with Email and Password

router.post("/register", validate(registerSchema), async (req, res) => {
  const { name, email, password,phone } = req.body;
  try {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const isUser = await prisma.user.findUnique({ 
      where: { email }
    });    

    if (isUser) {
      if (isUser.status === "VERIFIED") {
        return res.status(400).json({ error: "User is verified" });
      }
      try {
        await prisma.user.update({
          where: { phone, email },
          data: { 
            otp,
            otpExpiry: new Date(Date.now() + 5 * 60 * 1000),
           },
        });
        await sendEmailOTP(email, otp);
        return res.status(200).json({ message: "OTP sent successfully", userId: isUser.id, email });
      } catch (error) {
        return res.status(400).json({ error: "User's email or phone is incorrect!" });
      }
    }
    // Upsert the user: if the user exists, update; otherwise, create a new one
    const user = await prisma.user.upsert({
      where: { phone },
        update: {
          otp,
        otpExpiry: new Date(Date.now() + 5 * 60 * 1000), // OTP expires in 5 minutes
      },
      create: {
        phone,
        email,
        name,
        password: hashedPassword,
        otp,
        status: "UNVERIFIED",
        otpExpiry: new Date(Date.now() + 5 * 60 * 1000),
      },
    });


    // Send OTP to the user's phone
    // await sendOtp(phone, otp);
    await sendEmailOTP(email, otp);

    res.status(200).json({ message: "OTP sent successfully", userId: user.id, phone });
  } catch (error) {
    console.log('error: ', error);
    res.status(400).json({ error: error.message });
  }
});

router.post("/resend-otp", validate(reOTPSchema), async (req, res) => {
  const { email,phone } = req.body;
  try {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const isUser = await prisma.user.findUnique({ 
      where: { email }
    });

    if (isUser) {
      if (isUser.status === "VERIFIED") {
        return res.status(400).json({ error: "User is verified" });
      }
      try {
        await prisma.user.update({
          where: { phone, email },
          data: { 
            otp,
            otpExpiry: new Date(Date.now() + 5 * 60 * 1000),
           },
        });
        await sendEmailOTP(email, otp);
        return res.status(200).json({ message: "OTP sent successfully", userId: isUser.id, email });
      } catch (error) {
        console.log('error', error);
        
        return res.status(400).json({ error: "User's email or phone is incorrect!" });
      }
    }
    return res.status(400).json({ error: "User's email or phone is incorrect!" });
  } catch (error) {
    console.log('error: ', error);
    res.status(400).json({ error: error.message });
  }
});

router.post("/verify-otp", validate(verifyOtpSchema), async (req, res) => {
  const { phone,email, otp } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user || user.otp !== otp || new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    await prisma.user.update({
      where: { phone, email },
      data: { otp: null, otpExpiry: null, status: "VERIFIED", confirmedPhone: true },
    });

    res.status(200).json({ message: "User Verified" });
  } catch (error) {
    console.log('error: ', error);
    res.status(500).json({ error: error.message });
  }
});

// Login with Email and Password
router.post("/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ 
      where: { email }
    });
    // if (!user || !(await bcrypt.compare(password, user.password))) {
    //   return res.status(400).json({ error: "Invalid email or password" });
    // }

    const token = generateToken(user);
    res.status(200).json({ user: {id: user.id, email: user.email, name: user.name, role: user.role}, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Existing Category and Product Routes...

module.exports = router;
