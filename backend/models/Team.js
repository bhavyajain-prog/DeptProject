const mongoose = require("mongoose");

const evaluationSchema = new mongoose.Schema(
  {
    weeklyProgress: [
      {
        week: { type: Number, required: true },
        score: { type: Number, required: true, min: 0, max: 10 },
        feedback: { type: String },
        submittedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        submittedAt: { type: Date, default: Date.now },
      },
    ],
    finalEvaluation: {
      score: { type: Number, min: 0, max: 100 },
      feedback: { type: String },
      submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      submittedAt: { type: Date },
    },
  },
  { _id: false }
);

// Team schema definition
const teamSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      validate: {
        validator: (v) => /^[A-Z0-9]{6}$/.test(v),
        message: (props) =>
          `${props.value} is not a valid team code! Must be 6 characters alphanumeric.`,
      },
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    mentor: {
      assigned: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      assignedAt: { type: Date },
      preferences: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      currentPreference: { type: Number, default: 0 },
    },
    projectChoices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProjectBank",
        required: function () {
          return this.projectChoices.length === 0;
        },
      },
    ],
    // The final approved project (must be one of the choices)
    finalProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectBank",
    },
    evaluation: evaluationSchema,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    batch: { type: String, required: true },
    department: { type: String, required: true },
    feedback: [
      {
        message: { type: String, default: "" },
        byUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Enforce maximum team size
teamSchema.pre("save", function (next) {
  if (this.members.length > 3) {
    return next(new Error("A team cannot have more than 3 members."));
  }
  next();
});

// Indexes for performance
teamSchema.index({ batch: 1, department: 1 });
teamSchema.index({ "mentor.assigned": 1 });
teamSchema.index({ leader: 1 });
teamSchema.index({ "members.student": 1 });

// Virtual to get current team size
teamSchema.virtual("teamSize").get(function () {
  return this.members.length + 1; // +1 for the leader
});

// Virtual to get average weekly progress
teamSchema.virtual("averageWeeklyProgress").get(function () {
  if (!this.evaluation?.weeklyProgress?.length) return 0;
  const sum = this.evaluation.weeklyProgress.reduce(
    (acc, curr) => acc + curr.score,
    0
  );
  return sum / this.evaluation.weeklyProgress.length;
});

module.exports = mongoose.model("Team", teamSchema);
