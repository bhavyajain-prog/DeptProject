const mongoose = require("mongoose");

const projectBankSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    isApproved: { type: Boolean, default: false },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    proposedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    maxTeams: { type: Number, default: 1, min: 1 },
    assignedTeams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
    feedback: [
      {
        message: { type: String, default: "" },
        byUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        at: { type: Date, default: Date.now },
      },
    ],
    isActive: { type: Boolean, default: false }, 
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

projectBankSchema.index({ category: 1 });
projectBankSchema.index({ isApproved: 1 });

projectBankSchema.virtual("isAvailable").get(function () {
  return (
    this.isActive &&
    this.isApproved &&
    this.assignedTeams.length < this.maxTeams
  );
});

projectBankSchema.pre("save", function (next) {
  if (this.assignedTeams.length > this.maxTeams) {
    return next(
      new Error(
        `Cannot assign more than ${this.maxTeams} teams to this project`
      )
    );
  }
  next();
});

module.exports = mongoose.model("ProjectBank", projectBankSchema);
