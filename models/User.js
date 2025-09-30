const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Indian mobile regex: optional +91 or 0 or 91, then 10 digits starting with 6-9
const indianPhoneRegex = /^(?:\+91|91|0)?[6-9]\d{9}$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [emailRegex, "Please fill a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
      match: [indianPhoneRegex, "Please fill a valid Indian phone number"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique index on email
userSchema.index({ email: 1 }, { unique: true });

// Pre-save hook to hash password if modified
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 10;
    const hashed = await bcrypt.hash(this.password, saltRounds);
    this.password = hashed;
    next();
  } catch (err) {
    next(err);
  }
});

// Hide sensitive fields and convert _id to id
userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.password;
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
