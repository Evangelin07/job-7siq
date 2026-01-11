document.getElementById("applicationForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const formElement = this;
  const formData = new FormData(formElement);

  const fullName = formData.get("fullName")?.trim();
  const phone = formData.get("phone")?.trim();
  const email = formData.get("email")?.trim();
  const position = formData.get("position")?.trim();
  const dateOfApplication = formData.get("dateOfApplication")?.trim();
  const employmentType = formData.get("employmentType")?.trim(); // single select or text
  const maritalStatus = formData.get("maritalStatus")?.trim();
  const address = formData.get("address")?.trim();
  const dob = formData.get("dob")?.trim();
  const aadhar = formData.get("aadhar")?.trim();

  const education = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("education[")) {
      const field = key.match(/\[(\w+)\]/)[1];
      joining[field] = value.trim();
    }
  }


  const employment = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("employment[")) {
      const field = key.match(/\[(\w+)\]/)[1];
      joining[field] = value.trim();
    }
  }


  const skills = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("skills[")) {
      const field = key.match(/\[(\w+)\]/)[1];
      joining[field] = value.trim();
    }
  }


  const family = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("family[")) {
      const field = key.match(/\[(\w+)\]/)[1];
      joining[field] = value.trim();
    }
  }


  const emergency = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("emergency[")) {
      const field = key.match(/\[(\w+)\]/)[1];
      joining[field] = value.trim();
    }
  }


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
        employmentType,              // backend will normalize to array if needed
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