document.getElementById("applicationForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const formElement = this;
  const formData = new FormData(formElement);

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

  const educationalBackground = formData.getAll("educationalBackground");   // multiple inputs
  const employmentHistory = formData.getAll("employmentHistory");
  const skillsTraining = formData.getAll("skillsTraining");
  const familyDetails = formData.getAll("familyDetails");
  const emergencyContact = formData.getAll("emergencyContact");
  const joiningDetails = formData.get("joiningDetails");

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
    // Send JSON data to backend
    const res = await fetch("https://job-7siq.onrender.com/generate-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
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
        joining: joiningDetails
      })
    });

    if (!res.ok) {
      alert("PDF generation failed ❌");
      return;
    }

    // Get PDF blob and download
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
  }
});