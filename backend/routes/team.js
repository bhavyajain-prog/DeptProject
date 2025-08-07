const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const Team = require("../models/Team");
const User = require("../models/User");
const authenticate = require("../middleware/authenticate");
const authorizeRoles = require("../middleware/authorizeRoles");

router.get(
  "/my-team",
  authenticate,
  authorizeRoles("student"),
  asyncHandler(async (req, res) => {
    const stu = await User.findById(req.user._id);
    if (!stu) {
      return res.status(403).json({ message: "Unauthorized!" });
    }

    if (!stu.studentData?.currentTeam) {
      return res.status(404).json({ message: "No team found" });
    }

    const team = await Team.findById(stu.studentData.currentTeam)
      .populate({
        path: "leader",
        select:
          "name email username studentData.rollNumber studentData.batch studentData.department",
      })
      .populate({
        path: "members.student",
        select:
          "name email username studentData.rollNumber studentData.batch studentData.department",
      })
      .populate({
        path: "mentor.assigned",
        select:
          "name email username mentorData.department mentorData.designation mentorData.qualifications",
      })
      .populate({
        path: "mentor.preferences",
        select:
          "name email username mentorData.department mentorData.designation",
      })
      .populate({
        path: "projectChoices",
        select:
          "title description category difficulty techStack requiredSkills maxTeams",
      })
      .populate({
        path: "finalProject",
        select:
          "title description category difficulty techStack requiredSkills maxTeams",
      })
      .populate({
        path: "feedback.byUser",
        select: "name username role",
      })
      .populate({
        path: "projectAbstract.submittedBy",
        select: "name username",
      })
      .populate({
        path: "roleSpecification.submittedBy",
        select: "name username",
      })
      .populate({
        path: "roleSpecification.assignments.member",
        select: "name email username studentData.rollNumber",
      })
      .populate({
        path: "evaluation.weeklyStatus.submittedBy",
        select: "name username",
      });

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    console.log("Team data fetched:", team._id);
    return res.status(200).json({ team });
  })
);

module.exports = router;
