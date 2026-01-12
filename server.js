const express = require("express");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
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
  bank: Object,
  employment: Array,
  skills: Array,
  family: Array,
  emergency: Array,
  joining: Object,
  company: Object
});

const Form = mongoose.model("Form", formSchema);

/* ---------- GENERATE PDF ---------- */
app.post("/generate-pdf", async (req, res) => {
  try {
    let data = req.body;

    // Ensure arrays/objects exist so PDF never blank
    data.education = data.education || [];
    data.bank = data.bank || {};
    data.employment = data.employment || [];
    data.skills = data.skills || [];
    data.family = data.family || [];
    data.emergency = data.emergency || [];
    data.joining = data.joining || {};
    data.company = data.company || {};

    // Save to MongoDB
    await Form.create(data);

    // ---------- PDF ----------
    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=Application_Form.pdf");
    doc.pipe(res);

    // Optional logo
    const logoPath = path.join(__dirname, "public/loogo.jpeg");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 40, 30, { width: 100 });
      doc.moveDown(2);
    }

    // Header
    doc.fontSize(20).text("7S IQ PRIVATE LIMITED", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(16).text("Application Form", { align: "center" });
    doc.moveDown();

    // Personal info
    doc.fontSize(12);
    doc.text(`Full Name: ${data.fullName || ""}`);
    doc.text(`Phone: ${data.phone || ""}`);
    doc.text(`Email: ${data.email || ""}`);
    doc.text(`Position: ${data.position || ""}`);
    doc.text(`Date of Application: ${data.dateOfApplication || ""}`);
    doc.text(`Employment Type: ${Array.isArray(data.employmentType) ? data.employmentType.join(", ") : ""}`);
    doc.text(`Marital Status: ${data.maritalStatus || ""}`);
    doc.text(`Address: ${data.address || ""}`);
    doc.text(`DOB: ${data.dob || ""}`);
    doc.text(`Aadhar: ${data.aadhar || ""}`);
    doc.moveDown();

    // Education
    if (data.education.length) {
      doc.fontSize(13).text("Educational Background", { underline: true });
      doc.moveDown(0.5);
      data.education.forEach((e, i) => {
        doc.fontSize(12).text(
          `${i + 1}. ${e.degree || ""}, ${e.institute || ""}, ${e.year || ""}, ${e.grade || ""}, ${e.city || ""}`
        );
      });
      doc.moveDown();
    }

    // Bank Details (AFTER EDUCATION)
if (Object.keys(data.bank).length) {
  doc.fontSize(13).text("Bank Details", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12);
  doc.text(`Bank Name        : ${data.bank.bankName || ""}`);
  doc.text(`Account Holder   : ${data.bank.accountHolder || ""}`);
  doc.text(`Account Number   : ${data.bank.accountNumber || ""}`);
  doc.text(`IFSC Code        : ${data.bank.ifsc || ""}`);
  doc.text(`Branch           : ${data.bank.branch || ""}`);
  doc.moveDown();
}


    // Employment
    if (data.employment.length) {
      doc.fontSize(13).text("Employment History", { underline: true });
      doc.moveDown(0.5);
      data.employment.forEach((e, i) => {
        doc.fontSize(12).text(`${i + 1}. ${e.company || ""} – ${e.position || ""} (${e.year || ""})`);
        doc.text(`Reason: ${e.reason || ""}`);
        doc.moveDown(0.3);
      });
      doc.moveDown();
    }

    // Skills
    if (data.skills.length) {
      doc.fontSize(13).text("Skills & Training", { underline: true });
      doc.moveDown(0.5);
      data.skills.forEach((s, i) => {
        doc.fontSize(12).text(
          `${i + 1}. ${s.skill || ""} | ${s.level || ""} | ${s.year || ""} | ${s.institute || ""}`
        );
      });
      doc.moveDown();
    }

    // Family
    if (data.family.length) {
      doc.fontSize(13).text("Family Details", { underline: true });
      doc.moveDown(0.5);
      data.family.forEach((f, i) => {
        doc.fontSize(12).text(`${i + 1}. ${f.name || ""} – ${f.relation || ""} – ${f.occupation || ""}`);
      });
      doc.moveDown();
    }

    // Emergency
    if (data.emergency.length) {
      doc.fontSize(13).text("Emergency Contacts", { underline: true });
      doc.moveDown(0.5);
      data.emergency.forEach((e, i) => {
        doc.fontSize(12).text(
          `${i + 1}. ${e.name || ""}, ${e.relationship || ""}, ${e.occupation || ""}, ${e.qualification || ""}, ${e.city || ""}`
        );
      });
      doc.moveDown();
    }

    // Joining
    if (Object.keys(data.joining).length) {
      doc.fontSize(13).text("Joining Details", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);
      doc.text(`Joining Date        : ${data.joining.joiningDate || data.joining.date || ""}`);
      doc.text(`Fees                : ${data.joining.fees || ""}`);
      doc.text(`1st Installment     : ${data.joining.firstInstallment || ""}`);
      doc.text(`2nd Installment     : ${data.joining.secondInstallment || ""}`);
      doc.text(`3rd Installment     : ${data.joining.thirdInstallment || ""}`);
      doc.text(`Notice Period       : ${data.joining.noticePeriod || ""}`);
      doc.moveDown();
    }

    // Company
    if (Object.keys(data.company).length) {
      doc.fontSize(13).text("Company Details", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);
      doc.text(`Name: ${data.company.name || ""}`);
      doc.text(`Address: ${data.company.address || ""}`);
      doc.text(`Contact: ${data.company.contact || data.company.receiver || ""}`);
      doc.text(`Receiver Signature: ${data.company.receiverSignature || ""}`);
      doc.text(`HR Signature: ${data.company.hrSignature || ""}`);
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