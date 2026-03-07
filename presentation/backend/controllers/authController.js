const bcrypt = require("bcrypt");
const { Types } = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { decodeToken, signAccessToken, signRefreshToken, verifyRefreshToken } = require("../config/jwt");
const {
  OTP_PURPOSES,
  ROLES,
  SMARTBOARD_SESSION_STATUS
} = require("../config/constants");
const {
  createUser,
  getUserByEmail,
  getUserByLoginIdentifier,
  getUserById,
  markUserLogin,
  markUserAsVerified,
  updateStudentSetup,
  updatePendingUser,
  updateUserPassword
} = require("../models/userModel");
const {
  deleteUserRefreshTokens,
  deleteRefreshToken,
  getRefreshToken,
  saveRefreshToken
} = require("../models/refreshTokenModel");
const {
  authorizeSession,
  consumeSession,
  createSession,
  expireSession,
  getSessionByToken
} = require("../models/smartboardSessionModel");
const { assignFacultyClasses, getFacultyClasses } = require("../models/facultyClassModel");
const { getSubjectsByFacultyId } = require("../models/subjectModel");
const { createAndSendOtp, verifyOtp } = require("../services/otpService");
const { generateQrDataUrl } = require("../services/qrService");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { hashToken } = require("../utils/crypto");
const { normalizeEmail, validateEmailByRole } = require("../utils/emailRules");

function mapOtpReasonToError(reason) {
  if (reason === "OTP_EXPIRED") return new ApiError(410, "OTP expired");
  if (reason === "OTP_INVALID") return new ApiError(400, "Invalid OTP");
  if (reason === "OTP_USED") return new ApiError(400, "OTP already used");
  return new ApiError(400, "OTP not found");
}

const ALLOWED_STUDENT_YEARS = new Set([1, 2, 3, 4]);
const STUDENT_SECTIONS_BY_BRANCH = Object.freeze({
  ECE: ["ECE-A", "ECE-B"],
  CSE: ["CSE-A", "CSE-B"],
  CSM: ["CSM-A", "CSM-B"],
  MEC: ["MEC-A", "MEC-B"]
});
const MAX_PROFILE_PHOTO_LENGTH = 3_000_000;
const STUDENT_DEFAULT_NAME = "Student";
const STUDENT_ROLL_NUMBER_REGEX = /^[A-Za-z0-9][A-Za-z0-9-]{4,19}$/;

function deriveStudentName(email) {
  const localPart = String(email || "").split("@")[0] || "";
  const sanitized = localPart.replace(/[^a-zA-Z0-9]/g, " ").trim();
  return sanitized || STUDENT_DEFAULT_NAME;
}

const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role = ROLES.STUDENT,
    classId = null,
    classIds = []
  } = req.body;

  const normalizedName = String(name || "").trim();
  const normalizedEmail = normalizeEmail(email);
  const normalizedRole = String(role || ROLES.STUDENT).toUpperCase();
  const normalizedClassId =
    classId === null || classId === undefined || classId === ""
      ? null
      : String(classId).trim();
  const normalizedClassIds = Array.isArray(classIds)
    ? classIds
        .map((item) => String(item || "").trim())
        .filter(Boolean)
    : [];

  if (!normalizedEmail || !password) {
    throw new ApiError(400, "email and password are required");
  }

  if (![ROLES.STUDENT, ROLES.FACULTY].includes(normalizedRole)) {
    throw new ApiError(400, "Only STUDENT or FACULTY can self-register");
  }

  if (!validateEmailByRole(normalizedEmail, normalizedRole)) {
    throw new ApiError(400, "Email does not match institutional format for role");
  }

  if (String(password).length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  if (normalizedClassId !== null && !Types.ObjectId.isValid(normalizedClassId)) {
    throw new ApiError(400, "classId must be a valid id");
  }

  if (
    normalizedRole === ROLES.FACULTY &&
    normalizedClassIds.some((item) => !Types.ObjectId.isValid(item))
  ) {
    throw new ApiError(400, "classIds must contain valid ids");
  }

  if (normalizedRole === ROLES.FACULTY && !normalizedName) {
    throw new ApiError(400, "name is required for faculty registration");
  }

  const effectiveName =
    normalizedName ||
    (normalizedRole === ROLES.STUDENT
      ? deriveStudentName(normalizedEmail)
      : normalizedEmail.split("@")[0] || STUDENT_DEFAULT_NAME);
  const passwordHash = await bcrypt.hash(String(password), 12);
  const existingUser = await getUserByEmail(normalizedEmail);

  let userId;
  if (existingUser?.isVerified) {
    throw new ApiError(409, "Email already registered");
  }

  if (existingUser && !existingUser.isVerified) {
    const pendingUpdate = {
      name: effectiveName,
      passwordHash,
      role: normalizedRole
    };
    if (normalizedClassId !== null) {
      pendingUpdate.classId = normalizedClassId;
    }

    await updatePendingUser(existingUser.id, {
      ...pendingUpdate
    });
    userId = existingUser.id;
  } else {
    const createResult = await createUser({
      name: effectiveName,
      email: normalizedEmail,
      passwordHash,
      role: normalizedRole,
      classId: normalizedClassId,
      isVerified: false
    });
    userId = createResult.insertId;
  }

  if (normalizedRole === ROLES.FACULTY && normalizedClassIds.length) {
    await assignFacultyClasses(userId, normalizedClassIds);
  }

  await createAndSendOtp({
    email: normalizedEmail,
    userId,
    purpose: OTP_PURPOSES.REGISTRATION
  });

  res.status(201).json({
    message: "Account created. OTP sent to email.",
    email: normalizedEmail,
    otpExpiresInMinutes: Number(process.env.OTP_EXPIRY_MINUTES || 5)
  });
});

const verifyRegistrationOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !otp) {
    throw new ApiError(400, "email and otp are required");
  }

  const otpResult = await verifyOtp({
    email: normalizedEmail,
    otp,
    purpose: OTP_PURPOSES.REGISTRATION
  });

  if (!otpResult.valid) throw mapOtpReasonToError(otpResult.reason);

  const user = await getUserByEmail(normalizedEmail);
  if (!user) throw new ApiError(404, "User not found");

  await markUserAsVerified(user.id);

  res.status(200).json({
    message: "Account verified successfully"
  });
});

const resendRegistrationOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) throw new ApiError(400, "email is required");

  const user = await getUserByEmail(normalizedEmail);
  if (!user) throw new ApiError(404, "User not found");
  if (user.isVerified) throw new ApiError(409, "Account is already verified");

  await createAndSendOtp({
    email: normalizedEmail,
    userId: user.id,
    purpose: OTP_PURPOSES.REGISTRATION
  });

  res.status(200).json({
    message: "OTP resent successfully"
  });
});

const completeStudentSetup = asyncHandler(async (req, res) => {
  const { email, rollNumber, name, year, branch, section, mobile, profilePhoto } = req.body;

  const normalizedEmail = normalizeEmail(email);
  const normalizedRollNumber = String(rollNumber || "").trim().toUpperCase();
  const normalizedName = String(name || "").trim();
  const normalizedYear =
    year === null || year === undefined || year === "" ? null : Number(year);
  const normalizedBranch = String(branch || "").trim().toUpperCase();
  const normalizedSection = String(section || "").trim().toUpperCase();
  const normalizedMobile = String(mobile || "").replace(/\D/g, "");
  const normalizedProfilePhoto = String(profilePhoto || "").trim();

  if (
    !normalizedEmail ||
    !normalizedRollNumber ||
    !normalizedName ||
    !normalizedBranch ||
    !normalizedSection ||
    !normalizedMobile ||
    !normalizedProfilePhoto ||
    normalizedYear === null
  ) {
    throw new ApiError(
      400,
      "email, rollNumber, name, year, branch, section, mobile, and profilePhoto are required"
    );
  }

  if (!STUDENT_ROLL_NUMBER_REGEX.test(normalizedRollNumber)) {
    throw new ApiError(
      400,
      "Roll number must be 5-20 characters (letters, numbers, hyphen)"
    );
  }

  if (!ALLOWED_STUDENT_YEARS.has(normalizedYear)) {
    throw new ApiError(400, "Student year must be one of: 1, 2, 3, 4");
  }

  if (!STUDENT_SECTIONS_BY_BRANCH[normalizedBranch]) {
    throw new ApiError(400, "Department must be one of: ECE, CSE, CSM, MEC");
  }

  const allowedSections = STUDENT_SECTIONS_BY_BRANCH[normalizedBranch];
  if (!allowedSections.includes(normalizedSection)) {
    throw new ApiError(
      400,
      `Section must match the selected department: ${allowedSections.join(", ")}`
    );
  }

  if (!/^[6-9]\d{9}$/.test(normalizedMobile)) {
    throw new ApiError(400, "Mobile must be a valid 10-digit number");
  }

  if (!normalizedProfilePhoto.startsWith("data:image/")) {
    throw new ApiError(400, "Profile photo must be an image");
  }

  if (normalizedProfilePhoto.length > MAX_PROFILE_PHOTO_LENGTH) {
    throw new ApiError(400, "Profile photo is too large");
  }

  const user = await getUserByEmail(normalizedEmail);
  if (!user || user.role !== ROLES.STUDENT) {
    throw new ApiError(404, "Student account not found");
  }

  if (!user.isVerified) {
    throw new ApiError(403, "Verify account OTP before setup");
  }

  try {
    await updateStudentSetup(user.id, {
      rollNumber: normalizedRollNumber,
      name: normalizedName,
      year: normalizedYear,
      branch: normalizedBranch,
      section: normalizedSection,
      mobile: normalizedMobile,
      profilePhoto: normalizedProfilePhoto
    });
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.rollNumber) {
      throw new ApiError(409, "Roll number already exists");
    }
    throw error;
  }

  const updatedUser = await getUserById(user.id);
  res.status(200).json({
    message: "Student profile setup completed",
    user: {
      id: updatedUser.id,
      rollNumber: updatedUser.rollNumber,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      year: updatedUser.year,
      branch: updatedUser.branch,
      section: updatedUser.section,
      mobile: updatedUser.mobile,
      profilePhoto: updatedUser.profilePhoto
    }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, identifier, password, role = null } = req.body;
  const normalizedIdentifier = String(identifier || email || "").trim();
  const normalizedRole = role ? String(role).toUpperCase() : null;

  if (!normalizedIdentifier || !password) {
    throw new ApiError(400, "identifier (email or ID) and password are required");
  }

  const user = await getUserByLoginIdentifier(normalizedIdentifier);
  if (!user || !user.passwordHash) {
    throw new ApiError(401, "Invalid credentials");
  }
  if (normalizedRole && user.role !== normalizedRole) {
    throw new ApiError(403, `This account is not registered for ${normalizedRole} login`);
  }

  if (!user.isVerified) {
    throw new ApiError(403, "Account is not verified");
  }

  if (user.role === ROLES.SMARTBOARD) {
    throw new ApiError(403, "Smartboard accounts cannot use password login");
  }

  const validPassword = await bcrypt.compare(String(password), user.passwordHash);
  if (!validPassword) throw new ApiError(401, "Invalid credentials");

  const payload = { userId: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const decodedRefresh = decodeToken(refreshToken);

  await saveRefreshToken(
    user.id,
    hashToken(refreshToken),
    new Date(decodedRefresh.exp * 1000)
  );
  await markUserLogin(user.id);

  res.status(200).json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      rollNumber: user.rollNumber,
      year: user.year,
      branch: user.branch,
      section: user.section,
      mobile: user.mobile,
      profilePhoto: user.profilePhoto,
      classId: user.classId
    }
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    throw new ApiError(400, "email is required");
  }

  const user = await getUserByEmail(normalizedEmail);
  if (!user || !user.isVerified || user.role === ROLES.SMARTBOARD) {
    return res.status(200).json({
      message: "If the account exists, a reset OTP has been sent to email."
    });
  }

  await createAndSendOtp({
    email: normalizedEmail,
    userId: user.id,
    purpose: OTP_PURPOSES.PASSWORD_RESET
  });

  return res.status(200).json({
    message: "Password reset OTP sent to email."
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !otp || !newPassword) {
    throw new ApiError(400, "email, otp, and newPassword are required");
  }

  if (String(newPassword).length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const user = await getUserByEmail(normalizedEmail);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === ROLES.SMARTBOARD) {
    throw new ApiError(403, "Smartboard accounts cannot reset password here");
  }

  const otpResult = await verifyOtp({
    email: normalizedEmail,
    otp,
    purpose: OTP_PURPOSES.PASSWORD_RESET
  });

  if (!otpResult.valid) {
    throw mapOtpReasonToError(otpResult.reason);
  }

  const passwordHash = await bcrypt.hash(String(newPassword), 12);
  await updateUserPassword(user.id, passwordHash);
  await deleteUserRefreshTokens(user.id);

  return res.status(200).json({
    message: "Password reset successful. Please sign in."
  });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new ApiError(400, "refreshToken is required");

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const storedToken = await getRefreshToken(hashToken(refreshToken));
  if (!storedToken) throw new ApiError(401, "Refresh token revoked");

  if (new Date(storedToken.expiresAt).getTime() < Date.now()) {
    await deleteRefreshToken(hashToken(refreshToken));
    throw new ApiError(401, "Refresh token expired");
  }

  const user = await getUserById(decoded.userId);
  if (!user) throw new ApiError(401, "User not found");

  const accessToken = signAccessToken({
    userId: user.id,
    role: user.role
  });

  res.status(200).json({ accessToken });
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await deleteRefreshToken(hashToken(refreshToken));
  }
  res.status(204).send();
});

const createSmartboardSession = asyncHandler(async (req, res) => {
  const { smartboardName = null } = req.body;
  const sessionToken = uuidv4();
  const expiryMinutes = Number(process.env.SMARTBOARD_QR_EXPIRES_MINUTES || 2);
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  await createSession({
    sessionToken,
    smartboardName,
    expiresAt
  });

  const actionBase = process.env.APP_BASE_URL || process.env.CORS_ORIGINS?.split(",")[0];
  const qrActionUrl = `${String(actionBase || "http://localhost:5173").replace(/\/$/, "")}/smartboard/authorize?token=${encodeURIComponent(sessionToken)}`;
  const qrDataUrl = await generateQrDataUrl(qrActionUrl);

  res.status(201).json({
    sessionToken,
    smartboardName,
    expiresAt,
    qrActionUrl,
    qrDataUrl
  });
});

const authorizeSmartboardSessionByFaculty = asyncHandler(async (req, res) => {
  const { sessionToken } = req.body;
  if (!sessionToken) throw new ApiError(400, "sessionToken is required");

  const session = await getSessionByToken(sessionToken);
  if (!session) throw new ApiError(404, "Smartboard session not found");

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    await expireSession(sessionToken);
    throw new ApiError(410, "Smartboard session expired");
  }

  if (session.status !== SMARTBOARD_SESSION_STATUS.PENDING) {
    throw new ApiError(409, "Smartboard session already processed");
  }

  await authorizeSession(sessionToken, req.user.userId);

  res.status(200).json({
    message: "Smartboard authorized successfully"
  });
});

const requestSmartboardOtp = asyncHandler(async (req, res) => {
  const { sessionToken, facultyEmail } = req.body;
  const normalizedEmail = normalizeEmail(facultyEmail);

  if (!sessionToken || !normalizedEmail) {
    throw new ApiError(400, "sessionToken and facultyEmail are required");
  }

  if (!validateEmailByRole(normalizedEmail, ROLES.FACULTY)) {
    throw new ApiError(400, "Invalid faculty email format");
  }

  const faculty = await getUserByEmail(normalizedEmail);
  if (!faculty || faculty.role !== ROLES.FACULTY || !faculty.isVerified) {
    throw new ApiError(404, "Faculty account not found or not verified");
  }

  const session = await getSessionByToken(sessionToken);
  if (!session) throw new ApiError(404, "Smartboard session not found");

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    await expireSession(sessionToken);
    throw new ApiError(410, "Smartboard session expired");
  }

  if (session.status !== SMARTBOARD_SESSION_STATUS.PENDING) {
    throw new ApiError(409, "Session is not pending authorization");
  }

  await createAndSendOtp({
    email: normalizedEmail,
    userId: faculty.id,
    purpose: OTP_PURPOSES.SMARTBOARD_LOGIN,
    contextToken: sessionToken
  });

  res.status(200).json({
    message: "Smartboard OTP sent to faculty email"
  });
});

const verifySmartboardOtp = asyncHandler(async (req, res) => {
  const { sessionToken, facultyEmail, otp } = req.body;
  const normalizedEmail = normalizeEmail(facultyEmail);

  if (!sessionToken || !normalizedEmail || !otp) {
    throw new ApiError(400, "sessionToken, facultyEmail, and otp are required");
  }

  const session = await getSessionByToken(sessionToken);
  if (!session) throw new ApiError(404, "Smartboard session not found");

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    await expireSession(sessionToken);
    throw new ApiError(410, "Smartboard session expired");
  }

  if (session.status !== SMARTBOARD_SESSION_STATUS.PENDING) {
    throw new ApiError(409, "Session already processed");
  }

  const otpResult = await verifyOtp({
    email: normalizedEmail,
    otp,
    purpose: OTP_PURPOSES.SMARTBOARD_LOGIN,
    contextToken: sessionToken
  });
  if (!otpResult.valid) throw mapOtpReasonToError(otpResult.reason);

  const faculty = await getUserByEmail(normalizedEmail);
  if (!faculty || faculty.role !== ROLES.FACULTY) {
    throw new ApiError(404, "Faculty account not found");
  }

  await authorizeSession(sessionToken, faculty.id);
  res.status(200).json({
    message: "Smartboard authorized through OTP"
  });
});

const exchangeSmartboardSession = asyncHandler(async (req, res) => {
  const { sessionToken } = req.body;
  if (!sessionToken) throw new ApiError(400, "sessionToken is required");

  const session = await getSessionByToken(sessionToken);
  if (!session) throw new ApiError(404, "Smartboard session not found");

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    await expireSession(sessionToken);
    throw new ApiError(410, "Smartboard session expired");
  }

  if (session.status === SMARTBOARD_SESSION_STATUS.PENDING) {
    return res.status(200).json({ status: SMARTBOARD_SESSION_STATUS.PENDING });
  }

  if (session.status !== SMARTBOARD_SESSION_STATUS.AUTHORIZED) {
    throw new ApiError(401, "Session authorization failed");
  }

  const faculty = await getUserById(session.authorizedBy);
  if (!faculty) throw new ApiError(401, "Faculty authorization is invalid");

  const classes = await getFacultyClasses(faculty.id);
  const subjects = await getSubjectsByFacultyId(faculty.id);

  const accessToken = signAccessToken({
    userId: `smartboard:${session.id}`,
    role: ROLES.SMARTBOARD
  });

  await consumeSession(sessionToken);

  return res.status(200).json({
    status: SMARTBOARD_SESSION_STATUS.AUTHORIZED,
    accessToken,
    faculty: {
      id: faculty.id,
      name: faculty.name,
      email: faculty.email
    },
    classes,
    subjects
  });
});

module.exports = {
  authorizeSmartboardSessionByFaculty,
  completeStudentSetup,
  createSmartboardSession,
  exchangeSmartboardSession,
  forgotPassword,
  login,
  logout,
  refreshAccessToken,
  register,
  resetPassword,
  requestSmartboardOtp,
  resendRegistrationOtp,
  verifyRegistrationOtp,
  verifySmartboardOtp
};
