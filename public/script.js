app.post("/generate-pdf", upload.single("photo"), async (req, res) => {
  try {
    const data = req.body;

    // Save to MongoDB
    const form = new Form(data);
    await form.save();

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Application_Form.pdf"
    );

    doc.pipe(res);

    // ---------- HEADER ----------
    doc.fontSize(18).text("7S IQ PRIVATE LIMITED", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(14).text("Application Form", { align: "center" });
    doc.moveDown(1.5);

    // ---------- PHOTO ----------
    if (req.file?.buffer) {
      try {
        doc.image(req.file.buffer, 430, 80, { width: 120 });
      } catch (e) {
        console.log("Image error:", e.message);
      }
    }

    doc.fontSize(11);

    // ---------- BASIC DETAILS ----------
    doc.text(`Full Name           : ${data.fullName || ""}`);
    doc.text(`Phone Number        : ${data.phone || ""}`);
    doc.text(`Email ID            : ${data.email || ""}`);
    doc.text(`Position            : ${data.position || ""}`);
    doc.text(`Date of Application : ${data.dateOfApplication || ""}`);
    doc.text(
      `Employment Type     : ${
        Array.isArray(data.employmentType)
          ? data.employmentType.join(", ")
          : data.employmentType || ""
      }`
    );
    doc.text(`Marital Status      : ${data.maritalStatus || ""}`);
    doc.text(`Address             : ${data.address || ""}`);
    doc.text(`DOB                 : ${data.dob || ""}`);
    doc.text(`Aadhar Number       : ${data.aadhar || ""}`);

    doc.moveDown();

    // ---------- EDUCATION ----------
    if (data.education?.length) {
      doc.fontSize(13).text("Educational Background", { underline: true });
      doc.moveDown(0.5);

      data.education.forEach((e, i) => {
        doc.fontSize(11).text(
          `${i + 1}. ${e.degree || ""}, ${e.institute || ""}, ${e.year || ""}, ${e.grade || ""}, ${e.city || ""}`
        );
      });
      doc.moveDown();
    }

    // ---------- EMPLOYMENT ----------
    if (data.employment?.length) {
      doc.fontSize(13).text("Employment History", { underline: true });
      doc.moveDown(0.5);

      data.employment.forEach((e, i) => {
        doc.fontSize(11).text(
          `${i + 1}. ${e.company || ""} – ${e.position || ""} (${e.year || ""})`
        );
        doc.text(`Reason: ${e.reason || ""}`);
        doc.moveDown(0.3);
      });
      doc.moveDown();
    }

    // ---------- SKILLS ----------
    if (data.skills?.length) {
      doc.fontSize(13).text("Skills & Training", { underline: true });
      doc.moveDown(0.5);

      data.skills.forEach((s, i) => {
        doc.fontSize(11).text(
          `${i + 1}. ${s.skill || ""} | ${s.level || ""} | ${s.year || ""} | ${s.institute || ""}`
        );
      });
      doc.moveDown();
    }

    // ---------- FAMILY ----------
    if (data.family?.length) {
      doc.fontSize(13).text("Family Details", { underline: true });
      doc.moveDown(0.5);

      data.family.forEach((f, i) => {
        doc.fontSize(11).text(
          `${i + 1}. ${f.name || ""} – ${f.relation || ""} – ${f.occupation || ""}`
        );
      });
      doc.moveDown();
    }

    // ---------- EMERGENCY ----------
    if (data.emergency?.length) {
      doc.fontSize(13).text("Emergency Contacts", { underline: true });
      doc.moveDown(0.5);

      data.emergency.forEach((e, i) => {
        doc.fontSize(11).text(
          `${i + 1}. ${e.name || ""}, ${e.relationship || ""}, ${e.occupation || ""}, ${e.qualification || ""}, ${e.city || ""}`
        );
      });
      doc.moveDown();
    }

    // ---------- JOINING ----------
    if (data.joining) {
      doc.fontSize(13).text("Joining Details", { underline: true });
      doc.moveDown(0.5);

      doc.fontSize(11);
      doc.text(`Joining Date        : ${data.joining.joiningDate || ""}`);
      doc.text(`Fees                : ${data.joining.fees || ""}`);
      doc.text(
        `1st Installment     : ${data.joining.firstInstallment || ""}`
      );
      doc.text(
        `2nd Installment     : ${data.joining.secondInstallment || ""}`
      );
      doc.text(
        `3rd Installment     : ${data.joining.thirdInstallment || ""}`
      );
      doc.moveDown();
    }

    // ---------- COMPANY ----------
    if (data.company) {
      doc.fontSize(13).text("Company Details", { underline: true });
      doc.moveDown(0.5);

      doc.fontSize(11);
      doc.text(`Company Name        : ${data.company.name || ""}`);
      doc.text(`Receiving Person    : ${data.company.receiver || ""}`);
      doc.text(
        `Receiver Signature  : ${data.company.receiverSignature || ""}`
      );
      doc.text(`HR Signature        : ${data.company.hrSignature || ""}`);
    }

    doc.end();
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).send("PDF generation failed ❌");
  }
});
