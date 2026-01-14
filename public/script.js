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

  // Arrays
  const educationalBackground = buildArray("education");

  // Bank details
const bank = {};
for (const [key, value] of formData.entries()) {
  if (key.startsWith("bank[")) {
    const field = key.match(/\[(\w+)\]/)[1];
    bank[field] = value.trim();
  }
}

  const employmentHistory    = buildArray("employment");
  const skillsTraining       = buildArray("skills");
  const familyDetails        = buildArray("family");
  const emergencyContact     = buildArray("emergency");

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

  // text fields
  [
    "fullName","phone","email","position","dateOfApplication",
    "employmentType","maritalStatus","address","dob","aadhar"
  ].forEach(f => formData.append(f, rawFormData.get(f)));

  // photo ⭐⭐⭐
  formData.append("photo", rawFormData.get("photo"));

  // complex data → JSON
  formData.append("education", JSON.stringify(education));
  formData.append("employment", JSON.stringify(employment));
  formData.append("skills", JSON.stringify(skills));
  formData.append("family", JSON.stringify(family));
  formData.append("emergency", JSON.stringify(emergency));
  formData.append("bank", JSON.stringify(bank));
  formData.append("joining", JSON.stringify(joining));
  formData.append("company", JSON.stringify(company));

  try {
    const res = await fetch("https://job-7siq.onrender.com/generate-pdf", {
      method: "POST",
      body: formData   // ⭐ IMPORTANT
    });

    if (!res.ok) {
      alert("PDF generation failed ❌");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");

  } catch (err) {
    console.error(err);
    alert("Server error ❌");
  }
});
