const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const PDFDocument = require("pdfkit");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname,'public/index.html'));
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,'public')));
app.post('/submit',async(req,res)=>{
  const data= req.body;
})

/* ---------- MONGODB SETUP ---------- */
require("dotenv").config({ quiet: true  });

// Add this at the top of your file

// 2️⃣ Test if the variable is loaded correctly
console.log("MongoDB URI:", process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Atlas connected ✅"))
  .catch(err => console.error("MongoDB connection error:", err));


/* ---------- CREATE SCHEMA ---------- */
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

/* ---------- MULTER SETUP ---------- */
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* ---------- ROUTE ---------- */
app.post("/generate-pdf", upload.single("photo"), async (req, res) => {
  try {
    const formData = { ...req.body };

    // ---------- Fix arrays ----------
    if (formData.employmentType) {
      if (!Array.isArray(formData.employmentType)) formData.employmentType = [formData.employmentType];
      formData.employmentType = formData.employmentType.map(item => typeof item === "string" ? item : (item.value || ""));
    }

    if (formData.skills) {
      if (!Array.isArray(formData.skills)) formData.skills = [formData.skills];
      formData.skills = formData.skills.map(item => typeof item === "string" ? item : "");
    }

    // ---------- Handle uploaded photo ----------
    if (req.file) {
      formData.photo = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    // ---------- Save to MongoDB ----------
    const form = new Form(formData);
    await form.save();

    // ---------- Generate PDF ----------
async function generatePDF(html, pdfPath) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ]
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.pdf({ path: pdfPath, format: "A4", printBackground: true });
  await browser.close();
}



    // ---------- Add Logo ----------
const logoPath = path.join(__dirname, "loogo.jpeg");
if (fs.existsSync(logoPath)) {
  doc.image(logoPath, 40, 30, { width: 100 }); // x=40, y=30
  doc.moveDown(2); // spacing after logo
} else {
  console.log("Logo not found at:", logoPath);
}

    // ---------- Header ----------
    doc.fontSize(20).text("7S IQ PRIVATE LIMITED", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(16).text("Application Form", { align: "center" });
    doc.moveDown();

    // ---------- Personal Details ----------
    doc.fontSize(12).text(`Full Name: ${formData.fullName || ""}`);
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

    // ---------- Uploaded Photo ----------
if (formData.photo) {
  const img = Buffer.from(formData.photo.split(",")[1], "base64");
  const x = doc.page.width / 2 - 75; // center image
  const y = doc.y + 20; // some space below text
  doc.image(img, x, y, { width: 150, height: 150 });
  doc.moveDown(3); // space after image
}

    // ---------- Education ----------
    if (formData.education?.length) {
      doc.text("Education:");
      formData.education.forEach((edu, i) => {
        doc.text(`  ${i + 1}. ${edu.degree || ""} - ${edu.institution || ""} (${edu.year || ""})`);
      });
      doc.moveDown();
    }

    // ---------- Employment ----------
    if (formData.employment?.length) {
      doc.text("Employment History:");
      formData.employment.forEach((job, i) => {
        doc.text(`  ${i + 1}. ${job.company || ""} - ${job.position || ""} (${job.duration || ""})`);
      });
      doc.moveDown();
    }

    // ---------- Skills ----------
    if (formData.skills?.length) {
      doc.text("Skills: " + formData.skills.join(", "));
      doc.moveDown();
    }

    // ---------- Family ----------
    if (formData.family?.length) {
      doc.text("Family:");
      formData.family.forEach((member, i) => {
        doc.text(`  ${i + 1}. ${member.name || ""} - ${member.relation || ""} (${member.age || ""})`);
      });
      doc.moveDown();
    }

    // ---------- Emergency ----------
    if (formData.emergency?.length) {
      doc.text("Emergency Contacts:");
      formData.emergency.forEach((contact, i) => {
        doc.text(`  ${i + 1}. ${contact.name || ""} - ${contact.phone || ""} (${contact.relation || ""})`);
      });
      doc.moveDown();
    }

    // ---------- Joining ----------
    if (formData.joining) {
      doc.text("Joining Details:");
      Object.entries(formData.joining).forEach(([key, value]) => {
        doc.text(`  ${key}: ${value}`);
      });
      doc.moveDown();
    }

    // ---------- Company ----------
    if (formData.company) {
      doc.text("Company Details:");
      Object.entries(formData.company).forEach(([key, value]) => {
        doc.text(`  ${key}: ${value}`);
      });
      doc.moveDown();
    }

    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error ❌");
  }
});

/* ---------- START SERVER ---------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('Backend is running successfully on port ${PORT}');
});