const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const XLSX = require("xlsx");
const csvParse = require("csv-parse/sync");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Team = require("../models/Team");
const Project = require("../models/ProjectBank");
const authorizeRoles = require("../middleware/authorizeRoles");
const authenticate = require("../middleware/authenticate");
const insertUsers = require("../middleware/fixedUsers");
const fs = require("fs");
const path = require("path");

const upload = multer({ dest: "uploads/" });

router.get(
  "/students",
  authenticate,
  authorizeRoles("admin", "sub-admin"),
  asyncHandler(async (req, res) => {
    const students = await User.find({ role: "student" })
      .lean()
      .select("-password")
      .populate("studentData.currentTeam");
    if (!students || students.length === 0) {
      return res.status(404).json({ message: "No students found" });
    }
    res.status(200).json({ students });
  })
);

router.get(
  "/mentors",
  authenticate,
  authorizeRoles("admin", "sub-admin"),
  asyncHandler(async (req, res) => {
    const mentors = await User.find({ role: { $in: ["mentor", "sub-admin"] } })
      .lean()
      .select("-password")
      .populate("mentorData.assignedTeams");
    if (!mentors || mentors.length === 0) {
      return res.status(404).json({ message: "No mentors found" });
    }
    res.status(200).json({ mentors });
  })
);

router.get(
  "/teams",
  authenticate,
  authorizeRoles("admin", "sub-admin"),
  asyncHandler(async (req, res) => {
    const teams = await Team.find()
      .select(
        "_id code name leader members projectChoices mentor status feedback"
      )
      .populate({
        path: "members.student",
        select: "-password",
      })
      .populate({
        path: "leader",
        select: "-password",
      })
      .populate({
        path: "mentor.assigned",
        select: "-password",
      })
      .populate({
        path: "mentor.preferences",
        select: "-password",
      })
      .populate({
        path: "projectChoices",
        select: "_id title description category",
      })
      .exec(); // Don't use .lean() to retain virtuals

    if (!teams || teams.length === 0) {
      return res.status(404).json({ message: "No teams found" });
    }

    res.status(200).json({
      teams: teams.map((team) => ({
        ...team.toObject({ virtuals: true }),
      })),
    });
  })
);

router.get(
  "/projects",
  authenticate,
  authorizeRoles("admin"),
  asyncHandler(async (req, res) => {
    const projects = await Project.find({ isApproved: false })
      .select("_id title description category proposedBy")
      .lean();
    if (!projects || projects.length === 0) {
      return res.status(404).json({ message: "No unapproved projects found." });
    }
    res.status(200).json({ projects });
  })
);

router.post(
  "/approve-project/:id",
  authenticate,
  authorizeRoles("admin"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { feedback } = req.body;
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    if (project.isApproved) {
      return res.status(400).json({ message: "Project already approved." });
    }
    project.isApproved = true;
    project.approvedBy = req.user._id;
    if (Array.isArray(project.feedback) && feedback) {
      project.feedback.push({ message: feedback, byUser: req.user._id });
    }
    await project.save();
    res.status(200).json({ message: "Project approved successfully." });
  })
);

router.post(
  "/register",
  authenticate,
  authorizeRoles("admin"),
  asyncHandler(async (req, res) => {
    const {
      name,
      username,
      email,
      phone,
      role,
      studentData,
      mentorData,
      adminData,
    } = req.body;

    // Validate required fields
    if (!name || !username || !email || !phone || !role) {
      return res.status(400).json({
        message: "Name, username, email, phone, and role are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }, { phone }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists (username, email, or phone)" });
    }

    // Prepare base user data
    let userData = {
      name,
      username,
      email,
      phone,
      role,
    };

    // Validate and add role-specific fields
    if (role === "student") {
      userData.studentData = studentData || {};
    } else if (role === "mentor" || role === "sub-admin") {
      userData.mentorData = mentorData || {};
      // If the role is sub-admin, adminData is also required by the model
      if (role === "sub-admin") {
        // Assuming empNo and department for adminData are the same as mentorData for sub-admins
        // and permissions can be an empty array by default or set later.
        userData.adminData = adminData || {};
        userData.mentorData = mentorData || {};
      }
    } else if (role === "admin") {
      // For a pure admin (not sub-admin)
      userData.adminData = adminData || {};
    }

    // Hash default password (or a password from req.body if you plan to allow setting it on registration)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(
      process.env.DEFAULT_PASS || "password123", // Fallback if DEFAULT_PASS is not set
      salt
    );
    userData.password = hashedPassword;
    console.log(userData);

    // Create user object
    const user = new User(userData);

    // Save user to database
    await user.save();

    res
      .status(201)
      .json({ message: "User registered successfully", userId: user._id });
  })
);

router.delete(
  "/user/:id",
  authenticate,
  authorizeRoles("admin"),
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  })
);

router.put(
  "/user/:id",
  authenticate,
  authorizeRoles("admin"), // Or consider ["admin", "sub-admin"] if sub-admins can edit certain users
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, email, role, phone, username, studentData, mentorData } =
      req.body;

    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found" });
    }

    const newRole = role || userToUpdate.role;

    if (!["student", "mentor", "sub-admin"].includes(newRole)) {
      return res.status(400).json({
        message:
          "Updates via this route are restricted to students, mentors, or sub-admins.",
      });
    }

    let updateFields = {}; // Fields for $set

    // Update top-level fields
    if (name !== undefined) updateFields.name = name;
    if (email !== undefined && email !== userToUpdate.email) {
      const existing = await User.findOne({ email });
      if (existing && existing._id.toString() !== id)
        return res.status(400).json({ message: "Email already in use." });
      updateFields.email = email;
    }
    if (phone !== undefined && phone !== userToUpdate.phone) {
      const existing = await User.findOne({ phone });
      if (existing && existing._id.toString() !== id)
        return res.status(400).json({ message: "Phone already in use." });
      updateFields.phone = phone;
    }
    if (username !== undefined && username !== userToUpdate.username) {
      const existing = await User.findOne({ username });
      if (existing && existing._id.toString() !== id)
        return res.status(400).json({ message: "Username already in use." });
      updateFields.username = username;
    }
    if (role !== undefined && role !== userToUpdate.role) {
      updateFields.role = role;
    }

    // Handle studentData
    if (newRole === "student" && studentData) {
      Object.keys(studentData).forEach((key) => {
        if (studentData[key] !== undefined) {
          // Allow setting null or empty strings
          updateFields[`studentData.${key}`] = studentData[key];
        }
      });
    }

    // Handle mentorData and adminData implications for mentor/sub-admin
    if ((newRole === "mentor" || newRole === "sub-admin") && mentorData) {
      Object.keys(mentorData).forEach((key) => {
        if (mentorData[key] !== undefined) {
          if (key === "maxTeams") {
            updateFields[`mentorData.${key}`] = Number(mentorData[key]);
          } else {
            updateFields[`mentorData.${key}`] = mentorData[key];
          }
        }
      });
    }

    // Specific logic for role transitions and ensuring data consistency
    if (updateFields.role) {
      // If role is changing
      if (updateFields.role === "sub-admin") {
        updateFields["adminData.isSubAdmin"] = true;
        const empNoForAdmin =
          mentorData?.empNo || userToUpdate.mentorData?.empNo;
        const deptForAdmin =
          mentorData?.department || userToUpdate.mentorData?.department;

        if (!empNoForAdmin)
          return res.status(400).json({
            message: "Employee number required for sub-admin promotion.",
          });
        if (!deptForAdmin)
          return res
            .status(400)
            .json({ message: "Department required for sub-admin promotion." });

        updateFields["adminData.empNo"] = empNoForAdmin;
        updateFields["adminData.department"] = deptForAdmin;
        if (!userToUpdate.adminData) {
          // Initialize if adminData didn't exist
          updateFields["adminData.permissions"] = [];
        }
      } else if (
        userToUpdate.role === "sub-admin" &&
        updateFields.role === "mentor"
      ) {
        // Demoting from sub-admin to mentor
        updateFields["adminData.isSubAdmin"] = false;
        // Optionally clear other adminData fields if they are exclusively for sub-admins
      }
    } else if (newRole === "sub-admin") {
      // Role is not changing but is sub-admin, ensure adminData is correct
      updateFields["adminData.isSubAdmin"] = true;
      const empNoForAdmin = mentorData?.empNo || userToUpdate.mentorData?.empNo;
      const deptForAdmin =
        mentorData?.department || userToUpdate.mentorData?.department;

      if (empNoForAdmin) updateFields["adminData.empNo"] = empNoForAdmin;
      else if (!userToUpdate.adminData?.empNo)
        return res
          .status(400)
          .json({ message: "Employee number missing for sub-admin." });

      if (deptForAdmin) updateFields["adminData.department"] = deptForAdmin;
      else if (!userToUpdate.adminData?.department)
        return res
          .status(400)
          .json({ message: "Department missing for sub-admin." });

      if (!userToUpdate.adminData && empNoForAdmin && deptForAdmin) {
        // Initialize if adminData didn't exist but now has info
        updateFields["adminData.permissions"] = [];
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(200).json({
        message: "No updatable fields provided.",
        user: userToUpdate.toObject({ virtuals: true }),
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateFields },
      {
        new: true,
        runValidators: true,
        context: "query", // Important for some validators, especially unique checks on sub-documents if any
      }
    )
      .select("-password")
      .populate("studentData.currentTeam mentorData.assignedTeams");

    if (!updatedUser) {
      // Should ideally not happen if userToUpdate was found, but as a safeguard
      return res.status(500).json({ message: "Failed to update user." });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser.toObject({ virtuals: true }),
    });
  })
);

router.post(
  "/upload/:type",
  authenticate,
  authorizeRoles("admin"),
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const collectionMap = {
      students: User,
      mentors: User,
      projects: Project,
    };
    const { type } = req.params;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    // Validate file extension and size
    const allowedExt = [".xlsx", ".csv"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExt.includes(ext)) {
      fs.unlinkSync(file.path);
      return res
        .status(400)
        .json({ message: "Only .xlsx or .csv files are allowed" });
    }
    // TODO: Check file size
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      fs.unlinkSync(file.path);
      return res.status(400).json({ message: "File too large (max 5MB)" });
    }

    if (!["students", "mentors", "projects"].includes(type)) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ message: "Invalid type" });
    }
    let data = [];
    if (ext === ".xlsx") {
      const workbook = XLSX.readFile(file.path);
      data = [];
      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(sheet);
        // Add sheetName to each row
        sheetData.forEach((row) => {
          data.push({ ...row, sheetName });
        });
      });
    } else if (ext === ".csv") {
      const fileContent = fs.readFileSync(file.path, "utf-8");
      data = csvParse.parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
      });
    }
    // Remove the uploaded file after processing
    fs.unlinkSync(file.path);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.DEFAULT_PASS, salt);

    // Only handle mentors type for now
    if (type === "mentors") {
      // Prepare bulk operations
      const bulkOps = data.map((row) => {
        const email = row.email?.trim();
        const username = email
          ? email.replace(/@skit\\.ac\\.in$/, "")
          : undefined;
        return {
          updateOne: {
            filter: { email },
            update: {
              $set: {
                name: row.name,
                username,
                email,
                phone: row.phone,
                password: hashedPassword,
                role: "mentor",
                "mentorData.empNo": row.empNo,
                "mentorData.department": row.department,
                "mentorData.designation": row.designation,
              },
            },
            upsert: true,
          },
        };
      });
      if (bulkOps.length > 0) {
        await User.bulkWrite(bulkOps);
      }
      return res.status(200).json({
        message: `Mentors uploaded and processed successfully`,
        count: bulkOps.length,
      });
      // TODO: Verify students format
    } else if (type === "students") {
      // Prepare bulk operations
      const bulkOps = data.map((row) => {
        const email = row.email?.trim();
        const username = email.split("@")[0].trim();
        // console.log(username);

        return {
          updateOne: {
            filter: { email },
            update: {
              $set: {
                name: row.name,
                username,
                email,
                phone: row.phone,
                password: hashedPassword,
                role: "student",
                "studentData.rollNumber": row.rollNumber,
                "studentData.batch": row.batch,
                "studentData.department": row.department,
              },
            },
            upsert: true,
          },
        };
      });
      if (bulkOps.length > 0) {
        await User.bulkWrite(bulkOps);
      }
      return res.status(200).json({
        message: `Students uploaded and processed successfully`,
        count: bulkOps.length,
      });
    } else if (type === "projects") {
      let newData = [];
      data = data.filter((row) => {
        return (
          row["__EMPTY"] &&
          row["__EMPTY"] !== "Project Name" &&
          row["__EMPTY"] !== "Problem Statements" &&
          row["__EMPTY"] !== "Problem Statement"
        );
      });
      data.forEach((row) => {
        let project = {};
        console.log(row);
        if (!row["__EMPTY_1"]) {
          let fullText = row["__EMPTY"].toString().trim();
          let problem = [];
          let delimiter = "";

          if (fullText.includes(":-")) {
            delimiter = ":-";
          } else if (fullText.includes(":")) {
            delimiter = ":";
          } else if (fullText.includes("-")) {
            delimiter = "-";
          }

          if (delimiter) {
            let index = fullText.indexOf(delimiter);
            problem[0] = fullText.slice(0, index).trim(); // title
            problem[1] = fullText.slice(index + delimiter.length).trim(); // description
          } else {
            // fallback if no delimiter is found
            problem[0] = fullText;
            problem[1] = "";
          }

          project.title = problem[0].trim();
          project.description = problem[1].trim();
        } else {
          project.title = row["__EMPTY"];
          project.description = row["__EMPTY_1"];
        }
        project.category = row["sheetName"];
        newData.push(project);
      });
      // Prepare bulk operations
      const bulkOps = newData.map((row) => {
        return {
          updateOne: {
            filter: { title: row.title },
            update: {
              $set: {
                title: row.title,
                description: row.description,
                category: row.category,
                isApproved: true,
                approvedBy: req.user._id,
              },
            },
            upsert: true,
          },
        };
      });
      if (bulkOps.length > 0) {
        await Project.bulkWrite(bulkOps);
      }
      return res.status(200).json({
        message: `Projects uploaded and processed successfully`,
        count: newData.length,
      });
    } else {
      return res.status(400).json({ message: "Invalid type" });
    }
  })
);

router.post(
  "/approve/:code",
  authenticate,
  authorizeRoles("admin", "sub-admin"),
  asyncHandler(async (req, res) => {
    const { code } = req.params;
    const team = await Team.findOne({ code });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    if (team.status === "approved") {
      return res.status(400).json({ message: "Team already approved" });
    }
    // Validate all project choices are approved
    if (team.projectChoices && team.projectChoices.length > 0) {
      const projects = await Project.find({
        _id: { $in: team.projectChoices },
      });
      const notApproved = projects.find((p) => !p.isApproved);
      if (notApproved) {
        return res
          .status(400)
          .json({ message: "Either of the project is not approved yet" });
      }
    }

    team.status = "approved";
    const { feedback } = req.body;

    if (feedback) {
      team.feedback.push({
        message: feedback,
        byUser: req.user._id,
      });
    }

    await team.save();
    res.status(200).json({ message: "Team approved successfully" });
  })
);

router.post(
  "/reject/:code",
  authenticate,
  authorizeRoles("admin", "sub-admin"),
  asyncHandler(async (req, res) => {
    const { code } = req.params;
    const team = await Team.findOne({ code });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    if (team.status === "rejected") {
      return res.status(400).json({ message: "Team already rejected" });
    }
    team.status = "rejected";
    const feedback = req.body;
    if (feedback) {
      team.feedback.push({
        message: feedback,
        byUser: req.user._id,
      });
    }
    await team.save();
    res.status(200).json({ message: "Team rejected successfully" });
  })
);

router.get(
  "/remaining-mentors",
  authenticate,
  authorizeRoles("admin", "sub-admin"),
  asyncHandler(async (req, res) => {
    // Get all mentors who have assignedTeams less than maxTeams
    const mentors = await User.find({
      role: "mentor",
      $expr: {
        $lt: [
          { $size: { $ifNull: ["$mentorData.assignedTeams", []] } },
          { $ifNull: ["$mentorData.maxTeams", 0] },
        ],
      },
    }).select("_id name email");
    res.status(200).json({ mentors });
  })
);

router.get(
  "/remaining-students",
  authenticate,
  authorizeRoles("admin"),
  asyncHandler(async (req, res) => {
    // Get all students who are not assigned to any team
    const students = await User.find({
      role: "student",
      $or: [
        { "studentData.currentTeam": { $exists: false } },
        { "studentData.currentTeam": null },
      ],
    })
      .select("_id name email")
      .populate("studentData.currentTeam");
    res.status(200).json({ students });
  })
);

router.get(
  "/remaining-teams",
  authenticate,
  authorizeRoles("admin", "sub-admin"),
  asyncHandler(async (req, res) => {
    // Get all teams that are not assigned to any mentor and are approved or have no more mentor preferences
    const teams = await Team.find({
      $or: [
        { "mentor.assigned": { $exists: false } },
        { "mentor.assigned": null },
        { "mentor.currentPreference": -1 },
      ],
      status: "approved",
    })
      .select("_id leader members projectChoices")
      .populate("leader", "_id name email")
      .populate("members.student", "_id name email")
      .populate("projectChoices", "_id title description category")
      .lean(); // Use lean for performance
    const formattedTeams = teams.map((team) => ({
      _id: team._id,
      leader: team.leader,
      members: team.members.map((m) => m.student),
      projectChoices: team.projectChoices,
    }));
    res.status(200).json({ teams: formattedTeams });
  })
);

router.post(
  "/allocate/:code/:mentor_id",
  authenticate,
  authorizeRoles("admin", "sub-admin"),
  asyncHandler(async (req, res) => {
    const { code, mentor_id, finalProject } = req.params;
    const team = await Team.findOne({ code });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    const mentor = await User.findById(mentor_id);
    if (!mentor || mentor.role !== "mentor") {
      return res.status(404).json({ message: "Mentor not found" });
    }
    if (team.status !== "approved") {
      return res.status(400).json({ message: "Team is not approved" });
    }
    if (finalProject) {
      const project = await Project.findById(finalProject);
      if (!project || !project.isApproved) {
        return res
          .status(400)
          .json({ message: "Final project is not approved or does not exist" });
      }
      if (team.projectChoices && !team.projectChoices.includes(project._id)) {
        return res.status(400).json({
          message: "Final project must be one of the team's project choices",
        });
      }
      team.finalProject = project._id;
    }
    if (team.mentor.assigned) {
      return res.status(400).json({ message: "Team already has a mentor" });
    }
    if (mentor.mentorData.assignedTeams.length >= mentor.mentorData.maxTeams) {
      return res.status(400).json({
        message: `Mentor has already been assigned to ${mentor.mentorData.maxTeams} teams`,
      });
    }
    team.mentor.assigned = mentor._id;
    mentor.mentorData.assignedTeams.push(team._id);
    await team.save();
    await mentor.save();
    res.status(200).json({ message: "Mentor allocated successfully" });
  })
);

router.delete(
  "/flush-all",
  authenticate,
  authorizeRoles("admin"),
  asyncHandler(async (req, res) => {
    await Team.deleteMany({});
    await User.deleteMany({ role: { $nin: ["dev", "admin"] } });
    await insertUsers();
    res.status(200).json({ message: "All collections deleted successfully." });
  })
);

module.exports = router;
