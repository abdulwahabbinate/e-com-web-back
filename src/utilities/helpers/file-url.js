const path = require("path");

const buildFileUrl = (req, filePath = "") => {
  if (!filePath) return "";

  const uploadsRoot = path.resolve(process.cwd(), "uploads");
  let relativePath = path.relative(uploadsRoot, filePath);

  relativePath = relativePath.split(path.sep).join("/");

  return `${req.protocol}://${req.get("host")}/uploads/${relativePath}`;
};

module.exports = buildFileUrl;