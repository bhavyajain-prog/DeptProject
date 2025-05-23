const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function fixedUsers() {
  const users = [
    {
      username: "admin",
      name: "Administrator",
      email: process.env.ADMIN_EMAIL || "admin@dept.edu",
      password: process.env.ADMIN_PASS || "admin123",
      role: "admin",
      adminData: {
        empNo: "ADMIN001",
        department: "Administration",
        permissions: ["all"],
        isSubAdmin: false,
      },
    },
    {
      username: process.env.DEV_USER || "dev",
      name: "Developer",
      email: process.env.DEV_EMAIL || "dev@dept.edu",
      password: process.env.DEV_PASS || "dev123",
      role: "dev",
      // dev role doesn't require additional data
    },
  ];

  for (let user of users) {
    try {
      const existingUser = await User.findOne({ username: user.username });
      if (!existingUser) {
        console.log(`Creating ${user.role} user...`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);

        const userData = {
          username: user.username,
          name: user.name,
          email: user.email,
          password: hashedPassword,
          role: user.role,
          isActive: true,
          lastLogin: new Date(),
        };

        // Add role-specific data
        if (user.role === "admin") {
          userData.adminData = user.adminData;
        }

        const newUser = new User(userData);
        await newUser.save();
        // console.log(`${user.role} user created successfully`);
      } else {
        // console.log(`${user.role} user already exists`);
      }
    } catch (error) {
      console.error(`Error creating ${user.role} user:`, error.message);
    }
  }
}

module.exports = fixedUsers;
