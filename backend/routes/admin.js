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
        path: "mentor.preferences.mentor",
        select: "-password",
      })
      .populate({
        path: "project.projectBankRef",
      })
      .lean();
    if (!teams || teams.length === 0) {
      return res.status(404).json({ message: "No teams found" });
    }
    // Add virtuals manually since .lean() doesn't include them
    const teamsWithVirtuals = teams.map((team) => ({
      ...team,
      teamSize: team.members?.length || 0,
      averageWeeklyProgress: team.evaluation?.weeklyProgress?.length
        ? team.evaluation.weeklyProgress.reduce(
            (acc, curr) => acc + curr.score,
            0
          ) / team.evaluation.weeklyProgress.length
        : 0,
    }));
    res.status(200).json({ teams: teamsWithVirtuals });
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
    const { name, username, email, phone, role, rollNumber, empNo } = req.body;

    // Validate required fields
    if (!username || !email || !phone || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }, { phone }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Validate role-specific fields
    if (role === "student" && !rollNumber) {
      return res
        .status(400)
        .json({ message: "Roll number is required for students" });
    }
    if ((role === "mentor" || role === "sub-admin") && !empNo) {
      return res.status(400).json({
        message: "Employee number is required for mentors and sub-admins",
      });
    }

    // Hash default password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.DEFAULT_PASS, salt);

    // Create user object
    const user = new User({
      name,
      username,
      email,
      phone,
      role,
      password: hashedPassword,
      ...(role === "student" && { rollNumber }),
      ...(role === "mentor" || role === "sub-admin" ? { empNo } : {}),
    });

    // Save user to database
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
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
  authorizeRoles("admin"),
  asyncHandler(async (req, res) => {
    const { name, email, role, phone, username } = req.body;

    // Only allow update for student, mentor, or sub-admin
    if (!["student", "mentor", "sub-admin"].includes(role)) {
      return res.status(400).json({
        message:
          "Only students, mentors, or sub-admins can be updated via this route.",
      });
    }

    let updateData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(role && { role }),
      ...(phone && { phone }),
      ...(username && { username }),
    };

    if (role === "student" && req.body.studentData) {
      updateData.studentData = {
        ...(req.body.studentData.rollNumber && {
          rollNumber: req.body.studentData.rollNumber,
        }),
        ...(req.body.studentData.batch && {
          batch: req.body.studentData.batch,
        }),
      };
    } else if (
      (role === "mentor" || role === "sub-admin") &&
      req.body.mentorData
    ) {
      updateData.mentorData = {
        ...(req.body.mentorData.empNo && { empNo: req.body.mentorData.empNo }),
        ...(req.body.mentorData.department && {
          department: req.body.mentorData.department,
        }),
        ...(req.body.mentorData.designation && {
          designation: req.body.mentorData.designation,
        }),
        ...(req.body.mentorData.qualifications && {
          qualifications: req.body.mentorData.qualifications,
        }),
        ...(req.body.mentorData.maxTeams && {
          maxTeams: req.body.mentorData.maxTeams,
        }),
      };
    } else if (req.body.adminData) {
      // Prevent adminData update
      return res
        .status(400)
        .json({ message: "adminData cannot be updated via this route." });
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .populate("studentData.currentTeam mentorData.assignedTeams");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      message: "User updated successfully",
      user,
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
                role: "student",
                "studentData.rollNumber": row.rollNumber,
                "studentData.batch": row.batch,
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
    const feedback = req.body;
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
    const { code, mentor_id } = req.params;
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
