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

  // Arrays
 formData.set("education", JSON.stringify(buildArray("education")));

  // Bank details
const bank = {};
for (const [key, value] of formData.entries()) {
  if (key.startsWith("bank[")) {
    const field = key.match(/\[(\w+)\]/)[1];
    bank[field] = value.trim();
  }
}
formData.set("bank", JSON.stringify(bank));

  formData.set("employment", JSON.stringify(buildArray("employment")));
  formData.set("skills", JSON.stringify(buildArray("skills")));
  formData.set("family", JSON.stringify(buildArray("family")));
  formData.set("emergency", JSON.stringify(buildArray("emergency")));


  // Objects
  const joining = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("joining[")) {
      const field = key.match(/\[(\w+)\]/)[1];
      joining[field] = value.trim();
    }
  }
 formData.set("joining", JSON.stringify(joining));
 
  const company = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("company[")) {
      const field = key.match(/\[(\w+)\]/)[1];
      company[field] = value.trim();
    }
  }
 formData.set("company", JSON.stringify(company));

  try {
    // ✅ Send FormData directly, do NOT set Content-Type
    const res = await fetch("https://job-7siq.onrender.com/generate-pdf", {
      method: "POST",
      body: formData
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
