const router = require("express").Router();
const asyncHandler = require("express-async-handler");

const User = require("../models/User");
const Team = require("../models/Team");
const Project = require("../models/ProjectBank");
const authenticate = require("../middleware/authenticate");
const authorizeRoles = require("../middleware/authorizeRoles");

router.get(
  "/project-bank",
  authenticate,
  asyncHandler(async (_, res) => {
    const projects = await Project.find();
    res.status(200).json(projects);
  })
);

router.get(
  "/mentors",
  authenticate,
  asyncHandler(async (req, res) => {
    const mentors = await User.find({ role: "mentor" }, "_id name email");
    res.status(200).json(mentors);
  })
);

router.get(
  "/teams",
  authenticate,
  authorizeRoles("mentor"),
  asyncHandler(async (req, res) => {
    const teams = await Team.find({
      "mentor.preferences[mentor.currentPreference]": req.user._id,
      isApproved: true,
      $or: [
        { "mentor.assigned": { $exists: false } },
        { "mentor.assigned": null },
      ],
    })
      .select("_id leader members projectChoices")
      .populate("leader", "_id name email")
      .populate("members.student", "_id name email")
      .populate("projectChoices", "_id title description category")
      .lean(); // Use lean for performance
    if (!teams || teams.length === 0) {
      return res.status(404).json({ message: "No teams to approve." });
    }
    const formatTeams = teams.map((team) => {
      return {
        _id: team._id,
        leader: team.leader,
        members: team.members.map((m) => m.student),
        projectChoices: team.projectChoices,
      };
    });
    res.status(200).json(formatTeams);
  })
);

// Helper for mentor validation
function isCurrentMentor(team, userId) {
  return (
    team.mentor.preferences &&
    team.mentor.preferences[team.mentor.currentPreference]?.toString() ===
      userId.toString()
  );
}

router.post(
  "/create-team",
  authenticate,
  authorizeRoles("student"),
  asyncHandler(async (req, res) => {
    const { projectChoices, mentorChoices } = req.body;
    if (!projectChoices || !mentorChoices) {
      return res.status(400).json({ message: "All fields are required." });
    }
    // Generate a unique team code
    let code;
    let exists = true;
    while (exists) {
      code = Math.random().toString(36).substr(2, 6).toUpperCase(); // 6 characters
      exists = await Team.exists({ code });
    }

    const newTeam = new Team({
      code,
      leader: req.user._id,
      projectChoices,
      mentor: {
        preferences: mentorChoices,
      },
      batch: req.user.studentData.batch,
      department: req.user.studentData.department,
    });
    await newTeam.save();
    res
      .status(201)
      .json({ message: "Team created successfully.", team: newTeam });
  })
);

router.post(
  "/join-team",
  authenticate,
  authorizeRoles("student"),
  asyncHandler(async (req, res) => {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Team code is required." });
    }
    const team = await Team.findOne({ code });
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }
    if (team.members.length >= 3) {
      return res.status(400).json({ message: "Team is full." });
    }
    if (req.user.studentData.currentTeam) {
      return res
        .status(400)
        .json({ message: "You are already part of a team." });
    }
    if (team.batch !== req.user.studentData.batch) {
      return res
        .status(400)
        .json({ message: "Your batch does not match the team's batch." });
    }
    if (team.department !== req.user.studentData.department) {
      return res.status(400).json({
        message: "Your department does not match the team's department.",
      });
    }
    team.members.push({ student: req.user._id });
    await team.save();
    res.status(200).json({ message: "You have joined the team successfully." });
  })
);

router.post(
  "/propose-project",
  authenticate,
  authorizeRoles("student"),
  asyncHandler(async (req, res) => {
    let { title, description, category } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ message: "All fields are required." });
    }
    title = title.trim();
    description = description.trim();
    category = category.trim();
    // Case-insensitive duplicate check
    const existingProject = await Project.findOne({
      title: { $regex: `^${title}$`, $options: "i" },
    });
    if (existingProject) {
      return res
        .status(400)
        .json({ message: "A project with this title already exists." });
    }
    try {
      const newProject = new Project({
        title,
        description,
        category,
        proposedBy: req.user._id,
      });
      await newProject.save();
      res.status(201).json({
        message: "Project proposed. Please wait for admin to respond.",
        project: {
          _id: newProject._id,
          title: newProject.title,
          description: newProject.description,
          category: newProject.category,
        },
      });
    } catch (err) {
      res.status(500).json({
        message: "Failed to propose project. Please try again later.",
      });
    }
  })
);

router.post(
  "/leave-team",
  authenticate,
  authorizeRoles("student"),
  asyncHandler(async (req, res) => {
    const { newLeaderId, dismissTeam } = req.body;
    const teamId = req.user.studentData.currentTeam;
    if (!teamId) {
      return res.status(400).json({ message: "You are not part of any team." });
    }
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }
    // If the user is the leader
    if (team.leader.toString() === req.user._id.toString()) {
      if (dismissTeam) {
        // Remove currentTeam from all members
        await User.updateMany(
          {
            _id: { $in: [team.leader, ...team.members.map((m) => m.student)] },
          },
          { $set: { "studentData.currentTeam": null } }
        );
        await Team.deleteOne({ _id: teamId });
        return res
          .status(200)
          .json({ message: "Team has been dismissed and deleted." });
      } else if (newLeaderId) {
        // Validate new leader is a member
        const memberIndex = team.members.findIndex(
          (m) => m.student.toString() === newLeaderId
        );
        if (memberIndex === -1) {
          return res
            .status(400)
            .json({ message: "Selected new leader is not a team member." });
        }
        // Promote new leader
        const newLeader = team.members.splice(memberIndex, 1)[0];
        team.leader = newLeader.student;
        await team.save();
        // Remove old leader from team
        req.user.studentData.currentTeam = null;
        await req.user.save();
        return res
          .status(200)
          .json({ message: "You have left the team. New leader assigned." });
      } else {
        return res.status(400).json({
          message: "Please provide a new leader or choose to dismiss the team.",
        });
      }
    }
    // If the user is a member
    const memberIndex = team.members.findIndex(
      (member) => member.student.toString() === req.user._id.toString()
    );
    if (memberIndex === -1) {
      return res
        .status(400)
        .json({ message: "You are not a member of this team." });
    }
    team.members.splice(memberIndex, 1);
    if (team.members.length === 0) {
      await Team.deleteOne({ _id: teamId });
    } else {
      await team.save();
    }
    req.user.studentData.currentTeam = null;
    await req.user.save();
    res.status(200).json({ message: "You have left the team." });
  })
);

router.post(
  "/accept-team",
  authenticate,
  authorizeRoles("mentor"),
  asyncHandler(async (req, res) => {
    const { teamId, finalProject, feedback } = req.body;
    if (!teamId || !finalProject) {
      return res
        .status(400)
        .json({ message: "Team ID and final project are required." });
    }
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }
    if (team.mentor.assigned) {
      return res
        .status(400)
        .json({ message: "Team already has a mentor assigned." });
    }
    // Validate that the current mentor preference is this user
    if (!isCurrentMentor(team, req.user._id)) {
      return res
        .status(403)
        .json({ message: "You are not the current mentor for this team." });
    }
    // Check if finalProject is one of the projectChoices
    if (!team.projectChoices.map((p) => p.toString()).includes(finalProject)) {
      return res.status(400).json({
        message: "Selected project is not among the team's project choices.",
      });
    }
    const project = await Project.findById(finalProject);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    if (!project.isApproved) {
      return res.status(400).json({ message: "Project is not approved yet." });
    }
    if (project.assignedTeams.length >= project.maxTeams) {
      return res
        .status(400)
        .json({ message: "Project has reached its maximum team limit." });
    }
    const mentor = await User.findById(req.user._id);
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found." });
    }
    // Update team fields
    team.mentor.assigned = mentor._id;
    team.mentor.assignedAt = Date.now();
    team.finalProject = finalProject;
    project.isActive = false; // Mark project as inactive
    project.assignedTeams.push(team._id);
    if (feedback) {
      team.feedback.push({ message: feedback, byUser: mentor._id });
    }
    // Use a session for atomicity
    const session = await Team.startSession();
    session.startTransaction();
    try {
      await team.save({ session });
      // Use $addToSet to avoid duplicates
      await User.updateOne(
        { _id: mentor._id },
        { $addToSet: { "mentorData.assignedTeams": team._id } },
        { session }
      );
      await project.save({ session });
      session.commitTransaction();
      session.endSession();
      res.status(200).json({ message: "Team accepted successfully." });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      res
        .status(500)
        .json({ message: "Failed to accept team. Please try again later." });
    }
  })
);

router.post(
  "/reject-team",
  authenticate,
  authorizeRoles("mentor"),
  asyncHandler(async (req, res) => {
    const { teamId, feedback } = req.body;
    if (!teamId) {
      return res.status(400).json({ message: "Team ID is required." });
    }
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }
    // Validate that the current mentor preference is this user
    if (!isCurrentMentor(team, req.user._id)) {
      return res
        .status(403)
        .json({ message: "You are not the current mentor for this team." });
    }
    // Add feedback if provided
    if (feedback) {
      team.feedback.push({ message: feedback, byUser: req.user._id });
    }
    // Move to next mentor preference or set to -1 if out of range
    if (
      typeof team.mentor.currentPreference === "number" &&
      team.mentor.currentPreference < team.mentor.preferences.length - 1
    ) {
      team.mentor.currentPreference += 1;
    } else if (
      typeof team.mentor.currentPreference === "number" &&
      team.mentor.currentPreference >= team.mentor.preferences.length - 1
    ) {
      team.mentor.currentPreference = -1; // Sentinel value for no more mentors
    }
    await team.save();
    res
      .status(200)
      .json({ message: "Team rejected. Moved to next mentor preference." });
  })
);

module.exports = router;
