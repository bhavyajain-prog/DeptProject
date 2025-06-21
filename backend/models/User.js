const mongoose = require("mongoose");

const studentDataSchema = new mongoose.Schema(
  {
    rollNumber: {
      type: String,
      required: true,
      validate: {
        validator: (v) => /(\d\d[A-Z]{5}\d\d\d)/.test(v),
        message: (props) => `${props.value} is not a valid roll number!`,
      },
    },
    batch: { type: String, required: true },
    department: { type: String, required: true },
    currentTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
  },
  { _id: false }
);

const mentorDataSchema = new mongoose.Schema(
  {
    empNo: { type: String, required: true },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    qualifications: { type: String, default: "" },
    assignedTeams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
    maxTeams: { type: Number, default: 3 },
  },
  { _id: false }
);

const adminDataSchema = new mongoose.Schema(
  {
    empNo: { type: String, required: true },
    department: { type: String, required: true },
    permissions: [{ type: String }],
    isSubAdmin: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: {
      type: String,
      validate: {
        validator: function (v) {
          if (["admin", "dev"].includes(this.role)) {
            return true;
          }
          return /^\d{10}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid 10-digit phone number or is required for this role!`,
      },
      unique: true,
    },

    role: {
      type: String,
      enum: ["student", "admin", "mentor", "sub-admin", "dev"],
      required: true,
    },
    studentData: {
      type: studentDataSchema,
      required: function () {
        return this.role === "student";
      },
    },
    mentorData: {
      type: mentorDataSchema,
      required: function () {
        return ["mentor", "sub-admin"].includes(this.role);
      },
    },
    adminData: {
      type: adminDataSchema,
      required: function () {
        return ["admin", "sub-admin"].includes(this.role);
      },
    },
    firstLogin: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.index({ role: 1 });
userSchema.index({ role: 1, "studentData.batch": 1 });
userSchema.index({ role: 1, "mentorData.department": 1 });

userSchema.pre("validate", function (next) {
  if (!["admin", "dev"].includes(this.role) && !this.phone) {
    this.invalidate("phone", "Phone number is required for this role.");
  }
  next();
});

userSchema.virtual("roleData").get(function () {
  switch (this.role) {
    case "student":
      return this.studentData;
    case "mentor":
      return this.mentorData;
    case "admin":
    case "sub-admin":
      return this.adminData;
    default:
      return null;
  }
});

module.exports = mongoose.model("User", userSchema);
