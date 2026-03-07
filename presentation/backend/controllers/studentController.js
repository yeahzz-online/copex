const bcrypt = require("bcrypt");
const { Types } = require("mongoose");
const { ROLES } = require("../config/constants");
const { getUserById, updateUserPassword } = require("../models/userModel");
const { getSubjectById } = require("../models/subjectModel");
const { createUpload } = require("../models/uploadModel");
const Announcement = require("../mongoModels/Announcement");
const Class = require("../mongoModels/Class");
const Department = require("../mongoModels/Department");
const Subject = require("../mongoModels/Subject");
const Upload = require("../mongoModels/Upload");
const User = require("../mongoModels/User");
const { buildPublicFileUrl, createPresignedUploadUrl } = require("../services/s3Service");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

function buildOfficeViewerUrl(fileUrl) {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
}

function sanitizeFileName(fileName) {
  return String(fileName || "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_");
}

function sanitizeText(value, maxLength = 600) {
  const normalized = String(value || "").trim();
  if (!normalized) return null;
  return normalized.slice(0, maxLength);
}

function ensureObjectId(value, fieldName) {
  if (!value) throw new ApiError(400, `${fieldName} is required`);
  if (!Types.ObjectId.isValid(value)) throw new ApiError(400, `${fieldName} is invalid`);
  return String(value);
}

async function resolveStudentClassId(user) {
  if (!user) return null;
  if (user.classId) return user.classId;

  if (!user.branch || !user.year || !user.section) return null;

  const department = await Department.findOne({ code: String(user.branch).toUpperCase() })
    .select("_id")
    .lean()
    .exec();
  if (!department?._id) return null;

  const classDoc = await Class.findOne({
    departmentId: department._id,
    year: Number(user.year),
    section: String(user.section).toUpperCase()
  })
    .select("_id")
    .lean()
    .exec();

  return classDoc?._id ? String(classDoc._id) : null;
}

async function ensureStudentAndClass(userId) {
  const user = await getUserById(userId);
  if (!user || user.role !== ROLES.STUDENT) throw new ApiError(404, "Student not found");
  const classId = await resolveStudentClassId(user);
  return { user, classId };
}

async function getClassSubjects(classId) {
  if (!classId || !Types.ObjectId.isValid(classId)) return [];
  const subjects = await Subject.find({ classId })
    .populate({ path: "facultyId", select: "name email" })
    .sort({ name: 1 })
    .lean()
    .exec();

  return subjects.map((item) => ({
    id: String(item._id),
    name: item.name,
    code: item.code,
    classId: item.classId ? String(item.classId) : null,
    facultyId: item.facultyId?._id ? String(item.facultyId._id) : null,
    facultyName: item.facultyId?.name || null,
    facultyEmail: item.facultyId?.email || null
  }));
}

function mapPresentation(uploadDoc) {
  return {
    id: String(uploadDoc._id),
    subjectId: uploadDoc.subjectId?._id ? String(uploadDoc.subjectId._id) : String(uploadDoc.subjectId || ""),
    subjectName: uploadDoc.subjectId?.name || null,
    subjectCode: uploadDoc.subjectId?.code || null,
    title: uploadDoc.title || null,
    description: uploadDoc.description || null,
    fileName: uploadDoc.fileName || null,
    fileType: uploadDoc.fileType || null,
    s3Key: uploadDoc.s3Key || null,
    fileUrl: uploadDoc.fileUrl,
    officeViewerUrl: buildOfficeViewerUrl(uploadDoc.fileUrl),
    status: uploadDoc.status,
    feedback: uploadDoc.feedback || null,
    reviewedBy: uploadDoc.reviewedBy?._id ? String(uploadDoc.reviewedBy._id) : null,
    reviewedByName: uploadDoc.reviewedBy?.name || null,
    reviewedAt: uploadDoc.reviewedAt || null,
    category: uploadDoc.category || "STUDENT_PRESENTATION",
    createdAt: uploadDoc.createdAt,
    updatedAt: uploadDoc.updatedAt
  };
}

async function getStudentPresentations(studentId, options = {}) {
  const filter = {
    uploadedBy: studentId,
    category: "STUDENT_PRESENTATION"
  };

  if (options.subjectId && Types.ObjectId.isValid(options.subjectId)) {
    filter.subjectId = options.subjectId;
  }
  if (options.status) {
    filter.status = String(options.status).toUpperCase();
  }

  const docs = await Upload.find(filter)
    .populate({ path: "subjectId", select: "name code classId" })
    .populate({ path: "reviewedBy", select: "name email" })
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  return docs.map(mapPresentation);
}

async function validateSubjectForStudentClass(subjectId, classId) {
  const subject = await getSubjectById(subjectId);
  if (!subject) throw new ApiError(404, "Subject not found");
  if (String(classId || "") !== String(subject.classId || "")) {
    throw new ApiError(403, "You can upload only for your assigned class subjects");
  }
  return subject;
}

function buildStudentUploadKey({ user, subject, fileName }) {
  const safeName = sanitizeFileName(fileName);
  return `${user.year || "year-unknown"}/${(user.branch || "branch-unknown").toLowerCase()}/${(user.section || "section-unknown").toLowerCase()}/${(subject.code || subject.id).toString().toLowerCase()}/student/${Date.now()}-${safeName}`;
}

async function createPresentationUploadEntry({
  student,
  classId,
  subjectId,
  fileName,
  fileType,
  title,
  description
}) {
  const normalizedSubjectId = ensureObjectId(subjectId, "subjectId");
  const subject = await validateSubjectForStudentClass(normalizedSubjectId, classId);

  const key = buildStudentUploadKey({ user: student, subject, fileName });
  const uploadUrl = await createPresignedUploadUrl({
    key,
    contentType: fileType
  });
  const fileUrl = buildPublicFileUrl(key);

  const result = await createUpload({
    uploadedBy: student.id,
    subjectId: normalizedSubjectId,
    s3Key: key,
    fileUrl,
    status: "UPLOADED",
    title: sanitizeText(title, 140),
    description: sanitizeText(description, 1200),
    fileName: sanitizeText(fileName, 240),
    fileType: sanitizeText(fileType, 120),
    category: "STUDENT_PRESENTATION"
  });

  return {
    message: "Upload URL generated",
    uploadId: result.insertId,
    uploadUrl,
    fileUrl,
    officeViewerUrl: buildOfficeViewerUrl(fileUrl)
  };
}

async function getStudentAnnouncements({ classId }) {
  const docs = await Announcement.find({
    audienceRoles: { $in: [ROLES.STUDENT] },
    $or: [
      { classId: null },
      ...(classId && Types.ObjectId.isValid(classId) ? [{ classId }] : [])
    ]
  })
    .populate({ path: "createdBy", select: "name role" })
    .populate({ path: "subjectId", select: "name code" })
    .sort({ createdAt: -1 })
    .limit(40)
    .lean()
    .exec();

  return docs.map((item) => ({
    id: String(item._id),
    type: "ANNOUNCEMENT",
    title: item.title,
    message: item.message,
    priority: item.priority || "NORMAL",
    subjectId: item.subjectId?._id ? String(item.subjectId._id) : null,
    subjectName: item.subjectId?.name || null,
    subjectCode: item.subjectId?.code || null,
    createdBy: item.createdBy?.name || "System",
    createdByRole: item.createdBy?.role || null,
    createdAt: item.createdAt
  }));
}

const getStudentHome = asyncHandler(async (req, res) => {
  const { user, classId } = await ensureStudentAndClass(req.user.userId);
  const subjects = await getClassSubjects(classId);
  const subjectIdList = subjects.map((item) => item.id);

  const uploads = await Upload.find({
    uploadedBy: user.id,
    category: "STUDENT_PRESENTATION",
    ...(subjectIdList.length > 0 ? { subjectId: { $in: subjectIdList } } : {})
  })
    .populate({ path: "subjectId", select: "name code" })
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  const latestUploadBySubject = new Map();
  uploads.forEach((item) => {
    const key = item.subjectId?._id ? String(item.subjectId._id) : String(item.subjectId || "");
    if (key && !latestUploadBySubject.has(key)) {
      latestUploadBySubject.set(key, item);
    }
  });

  const subjectsWithStatus = subjects.map((subject) => {
    const latest = latestUploadBySubject.get(subject.id);
    return {
      ...subject,
      uploadStatus: latest?.status || "PENDING",
      uploadedAt: latest?.createdAt || null,
      latestFileUrl: latest?.fileUrl || null
    };
  });

  const uploadedCount = uploads.length;
  const subjectsCount = subjects.length;
  const pendingCount = Math.max(subjectsCount - subjectsWithStatus.filter((s) => s.uploadedAt).length, 0);
  const recentUploads = uploads.slice(0, 6).map(mapPresentation);
  const notifications = await getStudentAnnouncements({ classId });

  const activityHistory = uploads.slice(0, 10).map((item) => ({
    id: String(item._id),
    type: "UPLOAD",
    title: item.title || item.subjectId?.name || "Presentation",
    message: `Uploaded ${item.fileName || "file"} (${item.status})`,
    status: item.status,
    createdAt: item.createdAt
  }));

  res.status(200).json({
    profile: {
      id: user.id,
      rollNumber: user.rollNumber,
      name: user.name,
      email: user.email,
      year: user.year,
      branch: user.branch,
      section: user.section,
      mobile: user.mobile,
      profilePhoto: user.profilePhoto,
      lastLoginAt: user.lastLoginAt || null
    },
    metrics: {
      subjectsCount,
      uploadedCount,
      pendingCount
    },
    subjects: subjectsWithStatus,
    recentUploads,
    notifications: notifications.slice(0, 8),
    activityHistory
  });
});

const getStudentSubjects = asyncHandler(async (req, res) => {
  const { user, classId } = await ensureStudentAndClass(req.user.userId);
  const subjects = await getClassSubjects(classId);
  const uploads = await getStudentPresentations(user.id);
  const uploadsBySubject = uploads.reduce((acc, item) => {
    const key = String(item.subjectId || "");
    if (!key) return acc;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const rows = subjects.map((subject) => {
    const related = uploadsBySubject[subject.id] || [];
    const latest = related[0] || null;
    return {
      ...subject,
      uploadStatus: latest?.status || "PENDING",
      uploadedAt: latest?.createdAt || null,
      latestFileUrl: latest?.fileUrl || null,
      presentations: related.slice(0, 8)
    };
  });

  res.status(200).json({ subjects: rows });
});

const getStudentUploads = asyncHandler(async (req, res) => {
  const { status = "", subjectId = "" } = req.query;
  const uploads = await getStudentPresentations(req.user.userId, { status, subjectId });
  res.status(200).json({ uploads });
});

const requestUploadUrl = asyncHandler(async (req, res) => {
  const { subjectId, fileName, fileType = "application/octet-stream", title = "", description = "" } = req.body;
  if (!subjectId || !fileName) {
    throw new ApiError(400, "subjectId and fileName are required");
  }

  const { user, classId } = await ensureStudentAndClass(req.user.userId);
  const payload = await createPresentationUploadEntry({
    student: user,
    classId,
    subjectId,
    fileName,
    fileType,
    title,
    description
  });

  res.status(201).json(payload);
});

const updateStudentPresentation = asyncHandler(async (req, res) => {
  const { presentationId } = req.params;
  if (!Types.ObjectId.isValid(presentationId)) {
    throw new ApiError(400, "presentationId is invalid");
  }

  const { user, classId } = await ensureStudentAndClass(req.user.userId);
  const existing = await Upload.findOne({
    _id: presentationId,
    uploadedBy: user.id,
    category: "STUDENT_PRESENTATION"
  })
    .lean()
    .exec();
  if (!existing) throw new ApiError(404, "Presentation not found");

  const patch = {};
  if (req.body.title !== undefined) patch.title = sanitizeText(req.body.title, 140);
  if (req.body.description !== undefined) patch.description = sanitizeText(req.body.description, 1200);
  if (req.body.subjectId !== undefined) {
    const nextSubjectId = ensureObjectId(req.body.subjectId, "subjectId");
    await validateSubjectForStudentClass(nextSubjectId, classId);
    patch.subjectId = nextSubjectId;
  }

  if (!Object.keys(patch).length) throw new ApiError(400, "No fields provided for update");

  const updated = await Upload.findByIdAndUpdate(
    presentationId,
    { $set: patch },
    { new: true }
  )
    .populate({ path: "subjectId", select: "name code classId" })
    .populate({ path: "reviewedBy", select: "name email" })
    .lean()
    .exec();

  res.status(200).json({
    message: "Presentation updated",
    presentation: mapPresentation(updated)
  });
});

const requestPresentationReplaceUploadUrl = asyncHandler(async (req, res) => {
  const { presentationId } = req.params;
  const { fileName, fileType = "application/octet-stream" } = req.body;
  if (!Types.ObjectId.isValid(presentationId)) {
    throw new ApiError(400, "presentationId is invalid");
  }
  if (!fileName) throw new ApiError(400, "fileName is required");

  const { user } = await ensureStudentAndClass(req.user.userId);
  const existing = await Upload.findOne({
    _id: presentationId,
    uploadedBy: user.id,
    category: "STUDENT_PRESENTATION"
  })
    .populate({ path: "subjectId", select: "code" })
    .exec();
  if (!existing) throw new ApiError(404, "Presentation not found");

  const safeName = sanitizeFileName(fileName);
  const subjectCode = existing.subjectId?.code || "subject";
  const key = `${user.year || "year-unknown"}/${(user.branch || "branch-unknown").toLowerCase()}/${(user.section || "section-unknown").toLowerCase()}/${subjectCode.toLowerCase()}/student/${Date.now()}-${safeName}`;
  const uploadUrl = await createPresignedUploadUrl({
    key,
    contentType: fileType
  });
  const fileUrl = buildPublicFileUrl(key);

  existing.s3Key = key;
  existing.fileUrl = fileUrl;
  existing.fileName = sanitizeText(fileName, 240);
  existing.fileType = sanitizeText(fileType, 120);
  existing.status = "UPLOADED";
  existing.feedback = null;
  existing.reviewedBy = null;
  existing.reviewedAt = null;
  await existing.save();

  res.status(200).json({
    message: "Replacement upload URL generated",
    uploadUrl,
    fileUrl,
    officeViewerUrl: buildOfficeViewerUrl(fileUrl)
  });
});

const deleteStudentPresentation = asyncHandler(async (req, res) => {
  const { presentationId } = req.params;
  if (!Types.ObjectId.isValid(presentationId)) {
    throw new ApiError(400, "presentationId is invalid");
  }

  const { user } = await ensureStudentAndClass(req.user.userId);
  const deleted = await Upload.deleteOne({
    _id: presentationId,
    uploadedBy: user.id,
    category: "STUDENT_PRESENTATION"
  });
  if (!deleted.deletedCount) throw new ApiError(404, "Presentation not found");

  res.status(200).json({ message: "Presentation deleted" });
});

const getStudentNotifications = asyncHandler(async (req, res) => {
  const { user, classId } = await ensureStudentAndClass(req.user.userId);
  const [announcements, reviewUpdates] = await Promise.all([
    getStudentAnnouncements({ classId }),
    Upload.find({
      uploadedBy: user.id,
      category: "STUDENT_PRESENTATION",
      status: { $in: ["APPROVED", "REJECTED"] }
    })
      .populate({ path: "subjectId", select: "name code" })
      .sort({ reviewedAt: -1, updatedAt: -1 })
      .limit(40)
      .lean()
      .exec()
  ]);

  const reviewNotifications = reviewUpdates.map((item) => ({
    id: `review-${String(item._id)}`,
    type: "REVIEW_STATUS",
    title: item.status === "APPROVED" ? "Presentation Approved" : "Presentation Rejected",
    message:
      item.feedback ||
      `Your presentation for ${item.subjectId?.name || item.subjectId?.code || "subject"} is ${item.status}.`,
    status: item.status,
    subjectId: item.subjectId?._id ? String(item.subjectId._id) : null,
    subjectName: item.subjectId?.name || null,
    subjectCode: item.subjectId?.code || null,
    createdAt: item.reviewedAt || item.updatedAt || item.createdAt
  }));

  const notifications = [...announcements, ...reviewNotifications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 80);

  res.status(200).json({ notifications });
});

const getStudentActivity = asyncHandler(async (req, res) => {
  const { user } = await ensureStudentAndClass(req.user.userId);
  const uploads = await getStudentPresentations(user.id);

  const uploadActivity = uploads.slice(0, 50).map((item) => ({
    id: `upload-${item.id}`,
    type: "UPLOAD",
    title: item.title || item.subjectName || "Presentation",
    message: `Uploaded ${item.fileName || "presentation"} (${item.status})`,
    status: item.status,
    createdAt: item.createdAt
  }));

  const reviewActivity = uploads
    .filter((item) => item.reviewedAt && ["APPROVED", "REJECTED"].includes(item.status))
    .slice(0, 50)
    .map((item) => ({
      id: `review-${item.id}`,
      type: "REVIEW",
      title: item.status === "APPROVED" ? "Approved" : "Rejected",
      message: item.feedback || `${item.subjectName || "Presentation"} review updated`,
      status: item.status,
      createdAt: item.reviewedAt
    }));

  const loginActivity = [];
  if (user.lastLoginAt) {
    loginActivity.push({
      id: "last-login",
      type: "LOGIN",
      title: "Last Login",
      message: "You logged in successfully.",
      status: "SUCCESS",
      createdAt: user.lastLoginAt
    });
  }

  const activity = [...loginActivity, ...uploadActivity, ...reviewActivity].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  res.status(200).json({ activity });
});

const getStudentProfile = asyncHandler(async (req, res) => {
  const { user } = await ensureStudentAndClass(req.user.userId);
  res.status(200).json({
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      rollNumber: user.rollNumber,
      branch: user.branch,
      year: user.year,
      section: user.section,
      mobile: user.mobile,
      profilePhoto: user.profilePhoto,
      classId: user.classId,
      lastLoginAt: user.lastLoginAt || null
    }
  });
});

const updateStudentProfile = asyncHandler(async (req, res) => {
  const { user } = await ensureStudentAndClass(req.user.userId);
  const patch = {};

  if (req.body.name !== undefined) {
    const value = String(req.body.name || "").trim();
    if (!value) throw new ApiError(400, "name cannot be empty");
    patch.name = value;
  }
  if (req.body.mobile !== undefined) {
    const mobile = String(req.body.mobile || "").replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      throw new ApiError(400, "mobile must be a valid 10-digit number");
    }
    patch.mobile = mobile;
  }
  if (req.body.profilePhoto !== undefined) {
    const value = String(req.body.profilePhoto || "").trim();
    if (value && !value.startsWith("data:image/") && !/^https?:\/\//i.test(value)) {
      throw new ApiError(400, "profilePhoto must be an image data URL or valid URL");
    }
    patch.profilePhoto = value || null;
  }

  if (!Object.keys(patch).length) {
    throw new ApiError(400, "No fields provided for update");
  }

  const updated = await User
    .findByIdAndUpdate(user.id, { $set: patch }, { new: true })
    .lean()
    .exec();

  res.status(200).json({
    message: "Profile updated",
    profile: {
      id: String(updated._id),
      name: updated.name,
      email: updated.email,
      role: updated.role,
      rollNumber: updated.rollNumber || null,
      branch: updated.branch || null,
      year: updated.year || null,
      section: updated.section || null,
      mobile: updated.mobile || null,
      profilePhoto: updated.profilePhoto || null,
      classId: updated.classId ? String(updated.classId) : null,
      lastLoginAt: updated.lastLoginAt || null
    }
  });
});

const changeStudentPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "currentPassword and newPassword are required");
  }
  if (String(newPassword).length < 8) {
    throw new ApiError(400, "newPassword must be at least 8 characters");
  }

  const { user } = await ensureStudentAndClass(req.user.userId);
  const valid = await bcrypt.compare(String(currentPassword), user.passwordHash || "");
  if (!valid) throw new ApiError(401, "Current password is incorrect");

  const hash = await bcrypt.hash(String(newPassword), 12);
  await updateUserPassword(user.id, hash);

  res.status(200).json({ message: "Password changed successfully" });
});

module.exports = {
  changeStudentPassword,
  deleteStudentPresentation,
  getStudentActivity,
  getStudentHome,
  getStudentNotifications,
  getStudentProfile,
  getStudentSubjects,
  getStudentUploads,
  requestPresentationReplaceUploadUrl,
  requestUploadUrl,
  updateStudentPresentation,
  updateStudentProfile
};
