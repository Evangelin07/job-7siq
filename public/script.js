document.getElementById("applicationForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const formElement = this;
  const formData = new FormData(formElement);

  // Helper to build arrays of rows and skip empty ones
  function buildArray(prefix) {
    const obj = {};
    for (const [key, value] of formData.entries()) {
      if (key.startsWith(prefix)) {
        const match = key.match(/\[(\d+)\]\[(\w+)\]/);
        if (match) {
          const index = match[1];
          const field = match[2];
          if (!obj[index]) obj[index] = {};
          obj[index][field] = value.trim();
        }
      }
    }
    // ✅ Only keep rows where at least one field is filled
    return Object.values(obj).filter(row =>
      Object.values(row).some(val => val && val.length > 0)
    );
  }

  // Personal info
  const fullName = formData.get("fullName")?.trim();
  const phone = formData.get("phone")?.trim();
  const email = formData.get("email")?.trim();
  const position = formData.get("position")?.trim();
  const dateOfApplication = formData.get("dateOfApplication")?.trim();
  const employmentType = formData.get("employmentType")?.trim();
  const maritalStatus = formData.get("maritalStatus")?.trim();
  const address = formData.get("address")?.trim();
  const dob = formData.get("dob")?.trim();
  const aadhar = formData.get("aadhar")?.trim();


if (data.education?.length) {
  doc.fontSize(13).text("Educational Background", { underline: true });
  doc.moveDown(0.5);
  data.education.forEach((e) => {
    if (Object.values(e).some(val => val && val.length > 0)) {
      if (e.degree) doc.text(`Degree: ${e.degree}`);
      if (e.institute) doc.text(`Institute: ${e.institute}`);
      if (e.year) doc.text(`Year: ${e.year}`);
      if (e.grade) doc.text(`Grade: ${e.grade}`);
      if (e.city) doc.text(`City: ${e.city}`);
      doc.moveDown(0.3);
    }
  });
  doc.moveDown();
}

if (data.employment?.length) {
  doc.fontSize(13).text("Employment History", { underline: true });
  doc.moveDown(0.5);
  data.employment.forEach((e) => {
    if (Object.values(e).some(val => val && val.length > 0)) {
      if (e.company) doc.text(`Company: ${e.company}`);
      if (e.position) doc.text(`Position: ${e.position}`);
      if (e.year) doc.text(`Year: ${e.year}`);
      if (e.reason) doc.text(`Reason: ${e.reason}`);
      doc.moveDown(0.3);
    }
  });
  doc.moveDown();
}


if (data.skills?.length) {
  doc.fontSize(13).text("Skills & Training", { underline: true });
  doc.moveDown(0.5);
  data.skills.forEach((s) => {
    if (Object.values(s).some(val => val && val.length > 0)) {
      if (s.skill) doc.text(`Skill: ${s.skill}`);
      if (s.level) doc.text(`Level: ${s.level}`);
      if (s.year) doc.text(`Year: ${s.year}`);
      if (s.institute) doc.text(`Institute: ${s.institute}`);
      doc.moveDown(0.3);
    }
  });
  doc.moveDown();
}

if (data.family?.length) {
  doc.fontSize(13).text("Family Details", { underline: true });
  doc.moveDown(0.5);
  data.family.forEach((f) => {
    if (Object.values(f).some(val => val && val.length > 0)) {
      if (f.name) doc.text(`Name: ${f.name}`);
      if (f.relation) doc.text(`Relation: ${f.relation}`);
      if (f.occupation) doc.text(`Occupation: ${f.occupation}`);
      doc.moveDown(0.3);
    }
  });
  doc.moveDown();
}

if (data.emergency?.length) {
  doc.fontSize(13).text("Emergency Contacts", { underline: true });
  doc.moveDown(0.5);
  data.emergency.forEach((e) => {
    if (Object.values(e).some(val => val && val.length > 0)) {
      if (e.name) doc.text(`Name: ${e.name}`);
      if (e.relationship) doc.text(`Relationship: ${e.relationship}`);
      if (e.occupation) doc.text(`Occupation: ${e.occupation}`);
      if (e.qualification) doc.text(`Qualification: ${e.qualification}`);
      if (e.city) doc.text(`City: ${e.city}`);
      doc.moveDown(0.3);
    }
  });
  doc.moveDown();
}


  // Objects
  const joining = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("joining[")) {
      const field = key.match(/\[(\w+)\]/)[1];
      joining[field] = value.trim();
    }
  }

  const company = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("company[")) {
      const field = key.match(/\[(\w+)\]/)[1];
      company[field] = value.trim();
    }
  }

  // Validation checks
  if (!fullName || !phone || !email) {
    alert("Please fill all required fields ❗");
    return;
  }
  if (!/^[0-9]{10}$/.test(phone)) {
    alert("Phone number must be 10 digits ❗");
    return;
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    alert("Enter a valid email address ❗");
    return;
  }

  try {
    const res = await fetch("https://job-7siq.onrender.com/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        phone,
        email,
        position,
        dateOfApplication,
        employmentType,
        maritalStatus,
        address,
        dob,
        aadhar,
        education: educationalBackground,
        employment: employmentHistory,
        skills: skillsTraining,
        family: familyDetails,
        emergency: emergencyContact,
        joining,
        company
      })
    });

    if (!res.ok) {
      alert("PDF generation failed ❌");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Application_Form.pdf";
    a.click();
    window.URL.revokeObjectURL(url);

    alert("PDF downloaded successfully ✅");
    formElement.reset();
  } catch (err) {
    console.error("❌ Fetch error:", err);
    alert("Network error. Please try again.");
  }
});