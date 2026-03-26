const fs = require("fs");
const path = require("path");

const normalizeUploadsPath = (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== "string") return "";

  const cleanUrl = fileUrl.split("?")[0];
  const uploadsIndex = cleanUrl.lastIndexOf("/uploads/");

  if (uploadsIndex === -1) return "";

  const relativeUploadsPath = cleanUrl.substring(uploadsIndex + 1);
  return path.join(process.cwd(), relativeUploadsPath);
};

const deleteFileByUrl = (fileUrl) => {
  try {
    if (!fileUrl) return;

    const filePath = normalizeUploadsPath(fileUrl);

    if (!filePath) return;

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.log("deleteFileByUrl error:", error.message);
  }
};

module.exports = deleteFileByUrl;