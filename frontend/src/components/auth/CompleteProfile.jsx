import { useState } from "react";
import { useAuth } from "../../context";

const CompleteProfile = ({ tokenData, onComplete }) => {
  const [form, setForm] = useState({
    studentId: "",
    name: "",
    address: "",
    mobileNo: ""
  });

  const [loading, setLoading] = useState(false);
  const { registerV2 } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerV2({
        idToken: tokenData.idToken,
        ...form
      });
      onComplete();
    } catch (err) {
      console.error(err);
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
          margin-bottom: 12px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.05);
          color: white;
        }

        .cp-input:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.2);
          outline: none;
        }

        .cp-btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          background: linear-gradient(135deg, #4f46e5, #2563eb);
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }

        .cp-btn:hover {
          box-shadow: 0 10px 28px rgba(37,99,235,0.5);
        }
      `}</style>

      <form onSubmit={handleSubmit}>
        <input value={tokenData.email} disabled className="cp-input" />

        <input
          placeholder="Student ID"
          className="cp-input"
          onChange={(e) => setForm({ ...form, studentId: e.target.value })}
        />

        <input
          placeholder="Full Name"
          className="cp-input"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Address"
          className="cp-input"
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />

        <input
          type="tel"
          placeholder="Mobile Number"
          className="cp-input"
          onChange={(e) => setForm({ ...form, mobileNo: e.target.value })}
        />

        <button className="cp-btn" disabled={loading}>
          {loading ? "Saving..." : "Finish Registration"}
        </button>
      </form>
    </>
  );
};

export default CompleteProfile;