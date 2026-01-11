document.getElementById("applicationForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const formElement = this;
  const formData = new FormData(formElement);

function buildArray(prefix) {
  const obj = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith(prefix)) {
      // Example: education[0][degree]
      const match = key.match(/\[(\d+)\]\[(\w+)\]/);
      if (match) {
        const index = match[1];
        const field = match[2];
        if (!obj[index]) obj[index] = {};
        obj[index][field] = value.trim();
      }
    }
  }
  return Object.values(obj); // returns array of objects
}


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

  const educationalBackground = buildArray("education");
  const employmentHistory    = buildArray("employment");
  const skillsTraining       = buildArray("skills");
  const familyDetails        = buildArray("family");
  const emergencyContact     = buildArray("emergency");

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