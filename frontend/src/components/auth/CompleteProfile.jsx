import { useState } from "react";
import { useAuth } from "../../context";

const CompleteProfile = ({ tokenData, onComplete }) => {
  const [form, setForm] = useState({
    studentId: "",
    name: "",
    address: "",
    mobileNo: ""
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const { registerV2 } = useAuth();

  // 🔍 Validate single field
  const validateField = (field, value) => {
    let error = "";

    if (field === "studentId") {
      if (!/^[A-Z0-9]*$/.test(value)) {
        error = "Only capital letters and numbers allowed";
      }
    }

    if (field === "name") {
      if (!/^[A-Za-z ]*$/.test(value)) {
        error = "Only letters and spaces allowed";
      }
    }

    if (field === "address") {
      if (!/^[A-Za-z0-9,/ ]*$/.test(value)) {
        error = "Only letters, numbers, comma, / and spaces allowed";
      }
    }

    if (field === "mobileNo") {
      if (!/^[0-9]*$/.test(value)) {
        error = "Only numbers allowed";
      } else if (value.length > 10) {
        error = "Max 10 digits only";
      }
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // ✨ Handle input
  const handleChange = (field, value) => {
    let cleanedValue = value;

    if (field === "studentId") {
      cleanedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    }

    if (field === "name") {
      cleanedValue = value.replace(/[^A-Za-z ]/g, "");
    }

    if (field === "address") {
      cleanedValue = value.replace(/[^A-Za-z0-9,/ ]/g, "");
    }

    if (field === "mobileNo") {
      cleanedValue = value.replace(/[^0-9]/g, "").slice(0, 10);
    }

    // ✅ Clear API error when user edits
    setApiError("");

    setForm((prev) => ({ ...prev, [field]: cleanedValue }));
    validateField(field, cleanedValue);
  };

  // 🔒 Final validation
  const validateAll = () => {
    let newErrors = {};

    if (!/^[A-Z0-9]+$/.test(form.studentId)) {
      newErrors.studentId = "Invalid Student ID";
    }

    if (!/^[A-Za-z ]+$/.test(form.name)) {
      newErrors.name = "Invalid name";
    }

    if (!/^[A-Za-z0-9,/ ]+$/.test(form.address)) {
      newErrors.address = "Invalid address";
    }

    if (!/^[0-9]{10}$/.test(form.mobileNo)) {
      newErrors.mobileNo = "Must be exactly 10 digits";
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  // 🚀 Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) return;

    setLoading(true);
    setApiError("");

    try {
      await registerV2({
        idToken: tokenData.idToken,
        ...form
      });

      onComplete();
    } catch (err) {
      console.error(err);

      const message =
        err?.response?.data?.message || "Something went wrong";

      // ✅ Smarter mapping
      if (message.toLowerCase().includes("student id")) {
        setErrors((prev) => ({ ...prev, studentId: message }));
      } else if (message.toLowerCase().includes("email")) {
        setApiError("Email already exists");
      } else {
        setApiError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .cp-input {
          width: 100%;
          padding: 12px;
          margin-bottom: 6px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.05);
          color: white;
        }

        .cp-input-error {
          border: 1px solid #f87171;
        }

        .cp-error {
          color: #f87171;
          font-size: 12px;
          margin-bottom: 10px;
        }

        .cp-btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          background: linear-gradient(135deg, #4f46e5, #2563eb);
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        .cp-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <form onSubmit={handleSubmit}>
        <input value={tokenData.email} disabled className="cp-input" />

        <input
          placeholder="Student ID"
          className={`cp-input ${errors.studentId ? "cp-input-error" : ""}`}
          value={form.studentId}
          onChange={(e) => handleChange("studentId", e.target.value)}
        />
        {errors.studentId && <div className="cp-error">{errors.studentId}</div>}

        <input
          placeholder="Full Name"
          className={`cp-input ${errors.name ? "cp-input-error" : ""}`}
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
        {errors.name && <div className="cp-error">{errors.name}</div>}

        <input
          placeholder="Address"
          className={`cp-input ${errors.address ? "cp-input-error" : ""}`}
          value={form.address}
          onChange={(e) => handleChange("address", e.target.value)}
        />
        {errors.address && <div className="cp-error">{errors.address}</div>}

        <input
          type="tel"
          placeholder="Mobile Number"
          className={`cp-input ${errors.mobileNo ? "cp-input-error" : ""}`}
          value={form.mobileNo}
          onChange={(e) => handleChange("mobileNo", e.target.value)}
        />
        {errors.mobileNo && <div className="cp-error">{errors.mobileNo}</div>}

        {apiError && <div className="cp-error">{apiError}</div>}

        <button className="cp-btn" disabled={loading}>
          {loading ? "Saving..." : "Finish Registration"}
        </button>
      </form>
    </>
  );
};

export default CompleteProfile;