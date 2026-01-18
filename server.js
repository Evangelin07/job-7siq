const express = require("express");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
require("dotenv").config();

const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // JSON parser
app.use(express.static(path.join(__dirname, "public")));

/* ---------- HOME ---------- */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

/* ---------- MONGODB ---------- */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Atlas connected ✅"))
  .catch(err => console.error("MongoDB connection error:", err));

/* ---------- MULTER ---------- */
const uploadDir = path.join(__dirname, "uploads");
// Create uploads folder if it doesn't exist
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });


/* ---------- SCHEMA ---------- */

const formSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  email: String,
  dateOfApplication: String,
  position: String,
  employmentType: String,
  maritalStatus: String,
  address: String,
  dob: String,
  aadhar: String,

  education: Array,
  bank: Object,
  employment: Array,
  skills: Array,
  family: Array,
  emergency: Array,
  joining: Object,
  company: Object,
  photo: String
}, { timestamps: true });

const Form = mongoose.model("Form", formSchema);


/* ---------- GENERATE PDF ---------- */
app.post("/generate-pdf", upload.single("photo"), async (req, res) => {
  try {
const parseJSON = (value, defaultValue) => {
  if (!value) return defaultValue;
    try {
      return JSON.parse(value);
    } catch (err) {
        console.error("JSON parse error:", err);
        return defaultValue;

    }
};

    // Ensure arrays/objects exist
       const data = {
      fullName: req.body.fullName || "",
      phone: req.body.phone || "",
      email: req.body.email || "",
      position: req.body.position || "",
      dateOfApplication: req.body.dateOfApplication || "",
      employmentType: req.body.employmentType || "",
      maritalStatus: req.body.maritalStatus || "",
      address: req.body.address || "",
      dob: req.body.dob || "",
      aadhar: req.body.aadhar || "",

      education: parseJSON(req.body.education, []),
      bank: parseJSON(req.body.bank, {}),
      employment: parseJSON(req.body.employment, []),
      skills: parseJSON(req.body.skills, []),
      family: parseJSON(req.body.family, []),
      emergency: parseJSON(req.body.emergency, []),
      joining: parseJSON(req.body.joining, {}),
      company: parseJSON(req.body.company, {}),

      // ✅ photo status
      photo: req.file ? req.file.filename  : ""
    };
  console.log("Parsed data:", data);

    // Save to MongoDB
    await Form.create(data);

    // ---------- PDF ----------
    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=Application_Form.pdf");
    doc.pipe(res);

    // Optional logo
    const logoPath = path.join(__dirname, "public/logo.jpeg");
    if (fs.existsSync(logoPath))
      doc.image(logoPath, 40, 30, { width: 100 }).moveDown(2);

    doc.fontSize(20).text("7S IQ PRIVATE LIMITED", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(16).text("Application Form", { align: "center" });
    doc.moveDown();
  
if (req.file) {
      const photoPath = path.join(uploadDir, req.file.filename);
      if (fs.existsSync(photoPath)) doc.image(photoPath, 450, 30, { width: 100, height: 120 });
    }
    doc.moveDown(4);
   

    // Personal info
    doc.fontSize(12);
    Object.entries({
      "Full Name": data.fullName,
      "Phone": data.phone,
      "Email": data.email,
      "Position": data.position,
      "Date of Application": data.dateOfApplication,
      "Employment Type": data.employmentType,
      "Marital Status": data.maritalStatus,
      "Address": data.address,
      "DOB": data.dob,
      "Aadhar": data.aadhar
    }).forEach(([label, value]) => doc.text(`${label}: ${value || ""}`));
    doc.moveDown();

    // Helper to render arrays
    const renderArray = (title, array, formatter) => {
      if (Array.isArray(array) && array.length) {
        doc.fontSize(13).text(title, { underline: true });
        doc.moveDown(0.5);
        array.forEach((item, i) => formatter(item, i));
        doc.moveDown();
      }
    };

    renderArray("Educational Background", data.education, (e, i) =>
      doc.fontSize(12).text(`${i + 1}. ${e.degree || ""}, ${e.institute || ""}, ${e.year || ""}, ${e.grade || ""}, ${e.city || ""}`)
    );

    if (data.bank && Object.keys(data.bank).length) {
      doc.fontSize(13).text("Bank Details", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);
      Object.entries({
        "Bank Name": data.bank.bankName,
        "Account Number": data.bank.accountNumber,
        "IFSC Code": data.bank.ifsc,
        "Branch": data.bank.branch
      }).forEach(([label, value]) => doc.text(`${label}: ${value || ""}`));
      doc.moveDown();
    }

    renderArray("Employment History", data.employment, (e, i) => {
      doc.fontSize(12).text(`${i + 1}. ${e.company || ""} – ${e.position || ""} (${e.year || ""})`);
      doc.text(`Reason: ${e.reason || ""}`);
      doc.moveDown(0.3);
    });

    renderArray("Skills & Training", data.skills, (s, i) =>
      doc.fontSize(12).text(`${i + 1}. ${s.skill || ""} | ${s.level || ""} | ${s.year || ""} | ${s.institute || ""}`)
    );

    renderArray("Family Details", data.family, (f, i) =>
      doc.fontSize(12).text(`${i + 1}. ${f.name || ""} – ${f.relation || ""} – ${f.occupation || ""}`)
    );

    renderArray("Emergency Contacts", data.emergency, (e, i) =>
      doc.fontSize(12).text(`${i + 1}. ${e.name || ""}, ${e.relationship || ""}, ${e.occupation || ""}, ${e.qualification || ""}, ${e.city || ""}`)
    );

    if (data.joining && Object.keys(data.joining).length) {
      doc.fontSize(13).text("Joining Details", { underline: true });
      doc.moveDown(0.5);
      Object.entries({
        "Joining Date": data.joining.joiningDate || data.joining.date,
        "Fees": data.joining.fees,
        "1st Installment": data.joining.firstInstallment,
        "2nd Installment": data.joining.secondInstallment,
        "3rd Installment": data.joining.thirdInstallment,
        "Notice Period": data.joining.noticePeriod
      }).forEach(([label, value]) => doc.fontSize(12).text(`${label}: ${value || ""}`));
      doc.moveDown();
    }

    if (data.company && Object.keys(data.company).length) {
      doc.fontSize(13).text("Company Details", { underline: true });
      doc.moveDown(0.5);
      Object.entries({
        "Name": data.company.name,
        "Address": data.company.address,
        "Contact": data.company.contact || data.company.receiver,
        "Receiver Signature": data.company.receiverSignature,
        "HR Signature": data.company.hrSignature
      }).forEach(([label, value]) => doc.fontSize(12).text(`${label}: ${value || ""}`));
      doc.moveDown();
    }

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