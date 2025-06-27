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
    const projects = await Project.find({ isApproved: true, isActive: false })
      .select(
        "_id title description category proposedBy approvedBy assignedTeams maxTeams createdAt"
      )
      .populate("proposedBy", "name email")
      .populate("approvedBy", "name email")
      .sort({ category: 1, title: 1 })
      .lean();

    const projectsWithTeamCount = projects.map((project) => ({
      ...project,
      assignedTeamCount: project.assignedTeams
        ? project.assignedTeams.length
        : 0,
    }));

    res.status(200).json(projectsWithTeamCount);
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
      status: "approved",
      "mentor.assigned": { $in: [null, undefined] },
      $expr: {
        $eq: [
          {
            $arrayElemAt: ["$mentor.preferences", "$mentor.currentPreference"],
          },
          req.user._id,
        ],
      },
    })
      .select("_id leader members projectChoices")
      .populate("leader", "_id name email phone")
      .populate("members.student", "_id name email phone")
      .populate("projectChoices", "_id title description category")
      .lean();

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

function isCurrentMentor(team, userId) {
  const result =
    team.mentor.preferences &&
    team.mentor.preferences[team.mentor.currentPreference]?.toString() ===
      userId.toString();
  return result;
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

    let code;
    let exists = true;
    while (exists) {
      code = Math.random().toString(36).substr(2, 6).toUpperCase();
      exists = await Team.exists({ code });
    }
    const user = await User.findById(req.user._id);
    if (!user || user.role !== "student") {
      return res.status(403).json({ message: "You are not authorized." });
    }
    if (user.studentData.currentTeam) {
      return res
        .status(400)
        .json({ message: "You are already part of a team." });
    }
    if (projectChoices.length < 1 || projectChoices.length > 3) {
      return res

        .status(400)
        .json({ message: "You must select between 1 to 3 projects." });
    }
    if (mentorChoices.length < 1 || mentorChoices.length > 3) {
      return res
        .status(400)
        .json({ message: "You must select between 1 to 3 mentors." });
    }
    await user.save();
    await Project.updateMany(
      { _id: { $in: projectChoices } },
      { $set: { isActive: true } }
    );

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

    user.studentData.currentTeam = newTeam._id;
    await user.save();
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

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    user.studentData.currentTeam = team._id;
    await user.save();
    res.status(200).json({ message: "You have joined the team successfully." });
  })
);

router.post(
  "/propose-project",
  authenticate,
  authorizeRoles("student", "mentor"),
  asyncHandler(async (req, res) => {
    let { title, description, category } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ message: "All fields are required." });
    }
    title = title.trim();
    description = description.trim();
    category = category.trim();

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

    if (team.status !== "approved") {
      return res
        .status(400)
        .json({ message: "Team must be approved by coordinator first." });
    }

    if (team.mentor.assigned) {
      return res
        .status(400)
        .json({ message: "Team already has a mentor assigned." });
    }

    const isCurrentMentorResult = isCurrentMentor(team, req.user._id);

    if (!isCurrentMentorResult) {
      return res
        .status(403)
        .json({ message: "You are not the current mentor for this team." });
    }

    const projectChoicesStrings = team.projectChoices.map((p) => p.toString());

    if (!projectChoicesStrings.includes(finalProject)) {
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

    const currentTeamsCount = mentor.mentorData?.assignedTeams?.length || 0;
    const maxTeams = mentor.mentorData?.maxTeams || 0;

    if (currentTeamsCount >= maxTeams) {
      return res
        .status(400)
        .json({ message: "You have reached your maximum team capacity." });
    }

    const session = await Team.startSession();
    session.startTransaction();
    try {
      team.mentor.assigned = mentor._id;
      team.mentor.assignedAt = new Date();
      team.finalProject = finalProject;

      if (feedback) {
        team.feedback.push({ message: feedback, byUser: mentor._id });
      }

      await team.save({ session });

      await User.updateOne(
        { _id: mentor._id },
        { $addToSet: { "mentorData.assignedTeams": team._id } },
        { session }
      );

      project.assignedTeams.push(team._id);
      await project.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        message: "Team accepted successfully.",
        team: {
          _id: team._id,
          finalProject: finalProject,
          mentor: mentor._id,
        },
      });
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

    const isCurrentMentorResult = isCurrentMentor(team, req.user._id);

    if (!isCurrentMentorResult) {
      return res
        .status(403)
        .json({ message: "You are not the current mentor for this team." });
    }

    if (feedback) {
      team.feedback.push({ message: feedback, byUser: req.user._id });
    }

    if (
      typeof team.mentor.currentPreference === "number" &&
      team.mentor.currentPreference < team.mentor.preferences.length - 1
    ) {
      team.mentor.currentPreference += 1;
    } else if (
      typeof team.mentor.currentPreference === "number" &&
      team.mentor.currentPreference >= team.mentor.preferences.length - 1
    ) {
      team.mentor.currentPreference = -1;
    }

    await team.save();

    res
      .status(200)
      .json({ message: "Team rejected. Moved to next mentor preference." });
  })
);

router.get(
  "/my-proposed-projects",
  authenticate,
  authorizeRoles("student", "mentor"),
  asyncHandler(async (req, res) => {
    const projects = await Project.find({ proposedBy: req.user._id })
      .select(
        "_id title description category isApproved createdAt approvedBy feedback"
      )
      .populate("approvedBy", "name email")
      .populate("feedback.byUser", "name email")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(projects);
  })
);

router.post(
  "/withdraw-project/:id",
  authenticate,
  authorizeRoles("student"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (project.proposedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only withdraw projects that you have proposed.",
      });
    }

    if (project.isApproved) {
      return res.status(400).json({
        message:
          "Cannot withdraw an approved project. Please contact the admin.",
      });
    }

    await Project.findByIdAndDelete(id);

    res.status(200).json({
      message: "Project withdrawn successfully.",
    });
  })
);

router.post(
  "/leave-team",
  authenticate,
  authorizeRoles("student"),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const currentTeam = user.studentData.currentTeam;
    if (!currentTeam) {
      return res.status(400).json({ message: "You are not part of any team." });
    }

    const team = await Team.findById(currentTeam);
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }

    const leaderId = team.leader._id
      ? team.leader._id.toString()
      : team.leader.toString();
    const isLeader = leaderId === req.user._id.toString();

    team.members = team.members.filter(
      (member) => member.student.toString() !== req.user._id.toString()
    );

    if (isLeader && team.members.length > 0) {
      team.leader = team.members[0].student;
    }

    if (!isLeader && team.members.length === 0) {
      await Team.findByIdAndDelete(currentTeam);
    } else {
      await team.save();
    }

    user.studentData.currentTeam = null;
    await user.save();

    res.status(200).json({
      message: "You have successfully left the team.",
    });
  })
);

router.put(
  "/edit-project-choices",
  authenticate,
  authorizeRoles("student"),
  asyncHandler(async (req, res) => {
    const { projectChoices } = req.body;

    if (!projectChoices || !Array.isArray(projectChoices)) {
      return res.status(400).json({
        message: "Project choices are required and must be an array.",
      });
    }

    if (projectChoices.length < 1 || projectChoices.length > 3) {
      return res
        .status(400)
        .json({ message: "You must select between 1 to 3 projects." });
    }

    const user = await User.findById(req.user._id);
    if (!user || user.role !== "student") {
      return res.status(403).json({ message: "You are not authorized." });
    }

    if (!user.studentData.currentTeam) {
      return res.status(400).json({ message: "You are not part of any team." });
    }

    const team = await Team.findById(user.studentData.currentTeam);
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }

    const leaderId = team.leader._id
      ? team.leader._id.toString()
      : team.leader.toString();
    if (leaderId !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only team leaders can edit project choices." });
    }

    if (team.status === "approved") {
      return res
        .status(400)
        .json({ message: "Cannot edit project choices after team approval." });
    }

    if (team.mentor.assigned) {
      return res.status(400).json({
        message: "Cannot edit project choices after mentor assignment.",
      });
    }

    if (team.finalProject) {
      return res.status(400).json({
        message: "Cannot edit project choices after final project assignment.",
      });
    }

    const projects = await Project.find({
      _id: { $in: projectChoices },
      isApproved: true,
      isActive: true,
    });

    if (projects.length !== projectChoices.length) {
      return res.status(400).json({
        message: "One or more selected projects are invalid or not approved.",
      });
    }

    team.projectChoices = projectChoices;
    team.status = "pending";
    await team.save();

    await Project.updateMany(
      { _id: { $in: projectChoices } },
      { $set: { isActive: true } }
    );

    res.status(200).json({
      message:
        "Project choices updated successfully. Team status reset to pending for re-approval.",
      projectChoices: team.projectChoices,
      status: team.status,
    });
  })
);

router.get(
  "/mentor-teams",
  authenticate,
  authorizeRoles("mentor"),
  asyncHandler(async (req, res) => {
    try {
      const teams = await Team.find({
        "mentor.assigned": req.user._id,
      })
        .populate(
          "leader",
          "name email studentData.rollNumber studentData.batch studentData.department"
        )
        .populate(
          "members.student",
          "name email studentData.rollNumber studentData.batch studentData.department"
        )
        .populate("finalProject", "title description category")
        .populate("evaluation.weeklyProgress.submittedBy", "name")
        .populate("evaluation.finalEvaluation.submittedBy", "name")
        .sort({ createdAt: -1 })
        .lean();

      const formattedTeams = teams.map((team) => ({
        _id: team._id,
        code: team.code,
        leader: team.leader,
        members: team.members.map((m) => m.student),
        finalProject: team.finalProject,
        status: team.status,
        batch: team.batch,
        department: team.department,
        createdAt: team.createdAt,
        evaluation: team.evaluation || {
          weeklyProgress: [],
          finalEvaluation: {},
        },
        teamSize: (team.members?.length || 0) + 1,
        averageWeeklyProgress:
          team.evaluation?.weeklyProgress?.length > 0
            ? team.evaluation.weeklyProgress.reduce(
                (acc, curr) => acc + curr.score,
                0
              ) / team.evaluation.weeklyProgress.length
            : 0,
      }));

      res.status(200).json({
        success: true,
        teams: formattedTeams,
        totalTeams: formattedTeams.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch teams",
        error: error.message,
      });
    }
  })
);

router.post(
  "/add-weekly-score",
  authenticate,
  authorizeRoles("mentor"),
  asyncHandler(async (req, res) => {
    const { teamId, week, score, feedback } = req.body;

    if (!teamId || week === undefined || score === undefined) {
      return res.status(400).json({
        success: false,
        message: "Team ID, week number, and score are required.",
      });
    }

    if (score < 0 || score > 10) {
      return res.status(400).json({
        success: false,
        message: "Score must be between 0 and 10.",
      });
    }

    if (!Number.isInteger(week) || week < 1) {
      return res.status(400).json({
        success: false,
        message: "Week must be a positive integer.",
      });
    }

    try {
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({
          success: false,
          message: "Team not found.",
        });
      }

      if (
        !team.mentor.assigned ||
        team.mentor.assigned.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to evaluate this team.",
        });
      }

      if (!team.evaluation) {
        team.evaluation = { weeklyProgress: [], finalEvaluation: {} };
      }
      if (!team.evaluation.weeklyProgress) {
        team.evaluation.weeklyProgress = [];
      }

      const existingWeekIndex = team.evaluation.weeklyProgress.findIndex(
        (progress) => progress.week === week
      );

      const weeklyScore = {
        week,
        score,
        feedback: feedback || "",
        submittedBy: req.user._id,
        submittedAt: new Date(),
      };

      if (existingWeekIndex >= 0) {
        team.evaluation.weeklyProgress[existingWeekIndex] = weeklyScore;
      } else {
        team.evaluation.weeklyProgress.push(weeklyScore);
      }

      team.evaluation.weeklyProgress.sort((a, b) => a.week - b.week);

      await team.save();

      res.status(200).json({
        success: true,
        message:
          existingWeekIndex >= 0
            ? "Weekly score updated successfully."
            : "Weekly score added successfully.",
        weeklyScore,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to add weekly score",
        error: error.message,
      });
    }
  })
);

router.get(
  "/team-evaluations/:teamId",
  authenticate,
  authorizeRoles("mentor"),
  asyncHandler(async (req, res) => {
    const { teamId } = req.params;

    try {
      const team = await Team.findById(teamId)
        .populate("evaluation.weeklyProgress.submittedBy", "name")
        .populate("evaluation.finalEvaluation.submittedBy", "name")
        .lean();

      if (!team) {
        return res.status(404).json({
          success: false,
          message: "Team not found.",
        });
      }

      if (
        !team.mentor.assigned ||
        team.mentor.assigned.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to view evaluations for this team.",
        });
      }

      const evaluation = team.evaluation || {
        weeklyProgress: [],
        finalEvaluation: {},
      };

      const averageScore =
        evaluation.weeklyProgress.length > 0
          ? evaluation.weeklyProgress.reduce(
              (acc, curr) => acc + curr.score,
              0
            ) / evaluation.weeklyProgress.length
          : 0;

      res.status(200).json({
        success: true,
        teamId: team._id,
        teamCode: team.code,
        evaluation: {
          weeklyProgress: evaluation.weeklyProgress || [],
          finalEvaluation: evaluation.finalEvaluation || {},
          averageScore: Math.round(averageScore * 100) / 100,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch team evaluations",
        error: error.message,
      });
    }
  })
);

router.post(
  "/final-evaluation",
  authenticate,
  authorizeRoles("mentor"),
  asyncHandler(async (req, res) => {
    const { teamId, score, feedback } = req.body;

    if (!teamId || score === undefined) {
      return res.status(400).json({
        success: false,
        message: "Team ID and score are required.",
      });
    }

    if (score < 0 || score > 100) {
      return res.status(400).json({
        success: false,
        message: "Final score must be between 0 and 100.",
      });
    }

    try {
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({
          success: false,
          message: "Team not found.",
        });
      }

      if (
        !team.mentor.assigned ||
        team.mentor.assigned.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to provide final evaluation for this team.",
        });
      }

      if (!team.evaluation) {
        team.evaluation = { weeklyProgress: [], finalEvaluation: {} };
      }

      team.evaluation.finalEvaluation = {
        score,
        feedback: feedback || "",
        submittedBy: req.user._id,
        submittedAt: new Date(),
      };

      await team.save();

      res.status(200).json({
        success: true,
        message: "Final evaluation submitted successfully.",
        finalEvaluation: team.evaluation.finalEvaluation,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to submit final evaluation",
        error: error.message,
      });
    }
  })
);

router.post(
  "/submit-project-abstract",
  authenticate,
  authorizeRoles("student"),
  asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user.studentData.currentTeam) {
        return res.status(400).json({
          success: false,
          message: "You must be part of a team to submit project abstract.",
        });
      }

      const team = await Team.findById(user.studentData.currentTeam)
        .populate("leader", "name email")
        .populate("finalProject", "title description track")
        .populate("mentor.assigned", "name email");
      if (!team) {
        return res.status(404).json({
          success: false,
          message: "Team not found.",
        });
      }

      const leaderId = team.leader._id
        ? team.leader._id.toString()
        : team.leader.toString();

      if (leaderId !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Only team leader can submit project abstract.",
        });
      }

      const labCoordinator = await User.findOne({ role: "admin" }, "name");

      const projectId =
        req.body.projectId || `${team.code}-${new Date().getFullYear()}`;
      const projectTitle =
        req.body.projectTitle || team.finalProject?.title || "";
      const projectTrack =
        req.body.projectTrack || team.finalProject?.track || "";

      if (!req.body.briefIntroduction || !projectTrack) {
        return res.status(400).json({
          success: false,
          message: "Brief introduction and project track are required.",
        });
      }

      team.projectAbstract = {
        labCoordinator: req.body.labCoordinator || labCoordinator?.name || "",
        projectId: projectId,
        projectTitle: projectTitle,
        projectTrack: projectTrack,
        briefIntroduction: req.body.briefIntroduction,
        tools: req.body.tools || [],
        modules: req.body.modules || [],
        submittedAt: new Date(),
        submittedBy: req.user._id,
        status: "submitted",
      };

      await team.save();

      res.status(200).json({
        success: true,
        message: "Project abstract submitted successfully.",
        projectAbstract: team.projectAbstract,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to submit project abstract",
        error: error.message,
      });
    }
  })
);

router.post(
  "/submit-role-specification",
  authenticate,
  authorizeRoles("student"),
  asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user.studentData.currentTeam) {
        return res.status(400).json({
          success: false,
          message: "You must be part of a team to submit role specification.",
        });
      }

      const team = await Team.findById(user.studentData.currentTeam)
        .populate("leader", "name email")
        .populate("members.student", "name email");
      if (!team) {
        return res.status(404).json({
          success: false,
          message: "Team not found.",
        });
      }

      const leaderId = team.leader._id
        ? team.leader._id.toString()
        : team.leader.toString();
      if (leaderId !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Only team leader can submit role specification.",
        });
      }

      if (
        !team.projectAbstract ||
        team.projectAbstract.status !== "admin_approved"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Project abstract must be approved before submitting role specification.",
        });
      }

      const assignments = [];
      if (req.body.assignments && Array.isArray(req.body.assignments)) {
        for (const assignment of req.body.assignments) {
          const memberId = assignment.memberId || assignment.member;

          const isLeader = team.leader._id.toString() === memberId;
          const isMember = team.members.some(
            (m) => m.student._id.toString() === memberId
          );

          if (isLeader || isMember) {
            assignments.push({
              member: memberId,
              module: assignment.module,
              activities: (assignment.activities || []).map((activity) => ({
                name: activity.activity,
                softDeadline: activity.softDeadline,
                hardDeadline: activity.hardDeadline,
                details: activity.details,
                status: "pending",
              })),
            });
          }
        }
      }

      team.roleSpecification = {
        assignments: assignments,
        submittedAt: new Date(),
        submittedBy: req.user._id,
        status: "submitted",
      };

      await team.save();

      res.status(200).json({
        success: true,
        message: "Role specification submitted successfully.",
        roleSpecification: team.roleSpecification,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to submit role specification",
        error: error.message,
      });
    }
  })
);

router.post(
  "/submit-weekly-status",
  authenticate,
  authorizeRoles("student"),
  asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user.studentData.currentTeam) {
        return res.status(400).json({
          success: false,
          message: "You must be part of a team to submit weekly status.",
        });
      }

      const team = await Team.findById(user.studentData.currentTeam)
        .populate("leader", "name email")
        .populate("members.student", "name email")
        .populate("mentor.assigned", "name email");
      if (!team) {
        return res.status(404).json({
          success: false,
          message: "Team not found.",
        });
      }

      if (
        !team.roleSpecification ||
        team.roleSpecification.status !== "admin_approved"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Role specification must be approved before submitting weekly status.",
        });
      }

      const currentWeek = (team.evaluation?.weeklyStatus?.length || 0) + 1;

      if (!team.evaluation) {
        team.evaluation = {
          weeklyProgress: [],
          weeklyStatus: [],
          finalEvaluation: {},
        };
      }
      if (!team.evaluation.weeklyStatus) {
        team.evaluation.weeklyStatus = [];
      }

      const weeklyEntry = {
        week: currentWeek,
        dateRange: {
          from: new Date(req.body.dateRange?.from || req.body.from),
          to: new Date(req.body.dateRange?.to || req.body.to),
        },
        module: req.body.module,
        progress: req.body.progress,
        achievements: req.body.achievements || [],
        challenges: req.body.challenges || [],
        studentRemarks: req.body.studentRemarks || req.body.comments || "",
        mentorComments: "",
        mentorScore: null,
        submittedAt: new Date(),
        submittedBy: req.user._id,
      };

      team.evaluation.weeklyStatus.push(weeklyEntry);

      team.updateProjectProgress();

      await team.save();

      res.status(200).json({
        success: true,
        message: "Weekly status submitted successfully.",
        weeklyStatus: weeklyEntry,
        currentWeek: currentWeek,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to submit weekly status",
        error: error.message,
      });
    }
  })
);

router.get(
  "/team-forms",
  authenticate,
  authorizeRoles("student"),
  asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user.studentData.currentTeam) {
        return res.status(400).json({
          success: false,
          message: "You must be part of a team to view forms.",
        });
      }

      const team = await Team.findById(user.studentData.currentTeam)
        .select("projectAbstract roleSpecification evaluation")
        .populate("roleSpecification.assignments.member", "name email")
        .lean();

      if (!team) {
        return res.status(404).json({
          success: false,
          message: "Team not found.",
        });
      }

      res.status(200).json({
        success: true,
        forms: {
          projectAbstract: team.projectAbstract || null,
          roleSpecification: team.roleSpecification || null,
          weeklyStatus: team.evaluation?.weeklyStatus || [],
          summary: team.evaluation?.summary || null,
        },
        completionStatus: {
          projectAbstract: team.projectAbstract?.status || "draft",
          roleSpecification: team.roleSpecification?.status || "draft",
          weeklyStatus:
            (team.evaluation?.weeklyStatus?.length || 0) > 0
              ? "submitted"
              : "draft",
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch team forms",
        error: error.message,
      });
    }
  })
);

router.post(
  "/approve-project-abstract",
  authenticate,
  authorizeRoles("mentor", "admin"),
  asyncHandler(async (req, res) => {
    try {
      const { teamId, action, feedback } = req.body;

      const team = await Team.findById(teamId).populate("leader", "name email");
      if (!team) {
        return res.status(404).json({
          success: false,
          message: "Team not found.",
        });
      }

      if (!team.projectAbstract || team.projectAbstract.status === "draft") {
        return res.status(400).json({
          success: false,
          message: "Project abstract not submitted yet.",
        });
      }

      const userRole = req.user.role;
      const currentStatus = team.projectAbstract.status;

      if (userRole === "mentor" && currentStatus !== "submitted") {
        return res.status(400).json({
          success: false,
          message: "Project abstract must be submitted before mentor approval.",
        });
      }

      if (userRole === "admin" && currentStatus !== "mentor_approved") {
        return res.status(400).json({
          success: false,
          message:
            "Project abstract must be mentor approved before admin approval.",
        });
      }

      if (action === "approve") {
        if (userRole === "mentor") {
          team.projectAbstract.status = "mentor_approved";
          team.projectAbstract.mentorApproval = {
            approvedBy: req.user._id,
            approvedAt: new Date(),
            feedback: feedback || "",
          };
        } else if (userRole === "admin") {
          team.projectAbstract.status = "admin_approved";
          team.projectAbstract.adminApproval = {
            approvedBy: req.user._id,
            approvedAt: new Date(),
            feedback: feedback || "",
          };
        }
      } else if (action === "reject") {
        team.projectAbstract.status = "rejected";

        team.feedback.push({
          message: feedback || "Project abstract rejected",
          byUser: req.user._id,
          at: new Date(),
        });
      }

      await team.save();

      res.status(200).json({
        success: true,
        message: `Project abstract ${action}d successfully.`,
        projectAbstract: team.projectAbstract,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to process approval",
        error: error.message,
      });
    }
  })
);

router.post(
  "/approve-role-specification",
  authenticate,
  authorizeRoles("mentor", "admin"),
  asyncHandler(async (req, res) => {
    try {
      const { teamId, action, feedback } = req.body;

      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({
          success: false,
          message: "Team not found.",
        });
      }

      if (
        !team.roleSpecification ||
        team.roleSpecification.status === "draft"
      ) {
        return res.status(400).json({
          success: false,
          message: "Role specification not submitted yet.",
        });
      }

      const userRole = req.user.role;
      const currentStatus = team.roleSpecification.status;

      if (userRole === "mentor" && currentStatus !== "submitted") {
        return res.status(400).json({
          success: false,
          message:
            "Role specification must be submitted before mentor approval.",
        });
      }

      if (userRole === "admin" && currentStatus !== "mentor_approved") {
        return res.status(400).json({
          success: false,
          message:
            "Role specification must be mentor approved before admin approval.",
        });
      }

      if (action === "approve") {
        if (userRole === "mentor") {
          team.roleSpecification.status = "mentor_approved";
          team.roleSpecification.mentorApproval = {
            approvedBy: req.user._id,
            approvedAt: new Date(),
            feedback: feedback || "",
          };
        } else if (userRole === "admin") {
          team.roleSpecification.status = "admin_approved";
          team.roleSpecification.adminApproval = {
            approvedBy: req.user._id,
            approvedAt: new Date(),
            feedback: feedback || "",
          };
        }
      } else if (action === "reject") {
        team.roleSpecification.status = "rejected";
        team.feedback.push({
          message: feedback || "Role specification rejected",
          byUser: req.user._id,
          at: new Date(),
        });
      }

      await team.save();

      res.status(200).json({
        success: true,
        message: `Role specification ${action}d successfully.`,
        roleSpecification: team.roleSpecification,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to process approval",
        error: error.message,
      });
    }
  })
);

router.get(
  "/team-form-data",
  authenticate,
  authorizeRoles("student"),
  asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user._id).populate(
        "studentData.currentTeam"
      );

      if (!user.studentData.currentTeam) {
        return res.status(400).json({
          success: false,
          message: "You must be part of a team to access form data.",
        });
      }

      const team = await Team.findById(user.studentData.currentTeam._id)
        .populate("leader", "name email studentData")
        .populate("members.student", "name email studentData")
        .populate("mentor.assigned", "name email")
        .populate("finalProject", "title description track");

      const labCoordinator = await User.findOne(
        { role: "admin" },
        "name email"
      );

      const prePopulatedData = {
        form1: {
          labCoordinator: labCoordinator?.name || "",
          projectId:
            team.finalProject?.projectId ||
            `${team.code}-${new Date().getFullYear()}`,
          projectTitle: team.finalProject?.title || "",
          projectTrack: team.finalProject?.track || "",
          teamCode: team.code,
          teamLeader: team.leader.name,
          batch: team.batch,
          department: team.department,
          mentor: team.mentor.assigned?.name || "",
        },

        form2: {
          teamMembers: [
            {
              id: team.leader._id,
              name: team.leader.name,
              email: team.leader.email,
              studentId: team.leader.studentData?.studentId || "",
              isLeader: true,
            },
            ...team.members.map((m) => ({
              id: m.student._id,
              name: m.student.name,
              email: m.student.email,
              studentId: m.student.studentData?.studentId || "",
              isLeader: false,
            })),
          ],
          availableModules:
            team.projectAbstract?.modules?.map((m) => m.name) || [],
        },

        form3: {
          currentWeek: (team.evaluation?.weeklyStatus?.length || 0) + 1,
          teamCode: team.code,
          studentName: user.name,
          studentId: user.studentData?.studentId || "",
          projectTitle:
            team.projectAbstract?.projectTitle ||
            team.finalProject?.title ||
            "",
          mentor: team.mentor.assigned?.name || "",
          availableModules:
            team.projectAbstract?.modules?.map((m) => m.name) || [],
        },

        teamInfo: {
          code: team.code,
          leader: team.leader.name,
          memberCount: team.members.length + 1,
          status: team.status,
          hasMentor: !!team.mentor.assigned,
          hasProject: !!team.finalProject,
        },
      };

      res.status(200).json({
        success: true,
        data: prePopulatedData,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch team form data",
        error: error.message,
      });
    }
  })
);

module.exports = router;
