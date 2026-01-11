const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const PDFDocument = require("pdfkit");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

/* ---------- HOME ---------- */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

/* ---------- MONGODB ---------- */
console.log("MongoDB URI:", process.env.MONGODB_URI);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Atlas connected ✅"))
  .catch(err => console.error("MongoDB connection error:", err));

/* ---------- SCHEMA ---------- */
const formSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  email: String,
  dateOfApplication: String,
  position: String,
  employmentType: [String],
  maritalStatus: String,
  address: String,
  dob: String,
  aadhar: String,
  education: Array,
  employment: Array,
  skills: Array,
  family: Array,
  emergency: Array,
  joining: Object,
  company: Object,
  photo: String
});
const Form = mongoose.model("Form", formSchema);

/* ---------- MULTER ---------- */
const upload = multer({ storage: multer.memoryStorage() });

/* ---------- GENERATE PDF ---------- */
app.post("/generate-pdf", upload.single("photo"), async (req, res) => {
  try {
    const formData = { ...req.body };

    if (req.file) {
    const img = req.file.buffer; // Buffer directly from multer
    doc.image(img, { width: 120, height: 120, align: "center" });
  }

    // Convert to arrays if needed
    if (formData.employmentType && !Array.isArray(formData.employmentType)) {
      formData.employmentType = [formData.employmentType];
    }
    if (formData.skills && !Array.isArray(formData.skills)) {
      formData.skills = [formData.skills];
    }

    // Handle uploaded photo
    if (req.file) {
      formData.photo = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    // Save to DB
    const form = new Form(formData);
    await form.save();

    // PDFKit
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=application.pdf");
    doc.pipe(res);

    // Logo (safe check)
    const logoPath = path.join(__dirname, "public/loogo.jpeg"); // <-- put your logo here
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 40, 30, { width: 100 });
      doc.moveDown(2);
    } else {
      console.log("Logo not found at:", logoPath);
    }

    // Header
    doc.fontSize(20).text("7S IQ PRIVATE LIMITED", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(16).text("Application Form", { align: "center" });
    doc.moveDown();

    // Personal info
    doc.fontSize(12);
    doc.text(`Full Name: ${formData.fullName || ""}`);
    doc.text(`Phone: ${formData.phone || ""}`);
    doc.text(`Email: ${formData.email || ""}`);
    doc.text(`Position: ${formData.position || ""}`);
    doc.text(`Date of Application: ${formData.dateOfApplication || ""}`);
    doc.text(`Employment Type: ${formData.employmentType?.join(", ") || ""}`);
    doc.text(`Marital Status: ${formData.maritalStatus || ""}`);
    doc.text(`Address: ${formData.address || ""}`);
    doc.text(`DOB: ${formData.dob || ""}`);
    doc.text(`Aadhar: ${formData.aadhar || ""}`);
    doc.moveDown();

    // Photo (safe try-catch)
    try {
      if (formData.photo) {
        const img = Buffer.from(formData.photo.split(",")[1], "base64");
        doc.image(img, { width: 120, height: 120, align: "center" });
        doc.moveDown();
      }
    } catch (err) {
      console.log("Failed to add photo:", err);
    }

    // Education
    if (formData.education?.length) {
      doc.text("Education:");
      formData.education.forEach((e, i) => {
        doc.text(`${i + 1}. ${e.degree || ""} - ${e.institute || ""}`);
      });
      doc.moveDown();
    }

    // Employment
    if (formData.employment?.length) {
      doc.text("Employment History:");
      formData.employment.forEach((e, i) => {
        doc.text(`${i + 1}. ${e.company || ""} - ${e.position || ""}`);
      });
      doc.moveDown();
    }

    // Skills
    if (formData.skills?.length) {
      doc.text("Skills: " + formData.skills.join(", "));
      doc.moveDown();
    }

    // Emergency
    if (formData.emergency?.length) {
      doc.text("Emergency Contacts:");
      formData.emergency.forEach((e, i) => {
        doc.text(`${i + 1}. ${e.name || ""} - ${e.phone || ""}`);
      });
      doc.moveDown();
    }

    // End PDF
    doc.end();
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).send("Server error ❌");
  }
});

/* ---------- SERVER ---------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
