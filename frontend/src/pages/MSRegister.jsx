import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MicrosoftLogin from "../components/auth/MicrosoftLogin";
import CompleteProfile from "../components/auth/CompleteProfile";

const MSRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState("login");
  const [tokenData, setTokenData] = useState(null);

  // Extract redirectTo from query params
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get("redirectTo") || "/home";

  const handleLoginSuccess = (data) => {
    if (data.isNewUser) {
      setTokenData(data);
      setStep("profile");
    } else {
      navigate(redirectTo, { replace: true });
    }
  };

  const handleProfileComplete = () => {
    navigate(redirectTo, { replace: true });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        .reg-root { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; background-image: url('/uni.jpeg'); background-size: cover; background-position: center; position: relative; font-family: 'Outfit', sans-serif; }
        .reg-card { position: relative; z-index: 1; width: 100%; max-width: 420px; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(24px); border-radius: 24px; padding: 2.5rem; box-shadow: 0 0 0 1px rgba(255,255,255,0.05) inset, 0 40px 80px rgba(0,0,0,0.6), 0 0 120px rgba(59,130,246,0.15); }
        .reg-heading { font-size: 1.8rem; color: white; margin-bottom: 0.5rem; }
        .reg-heading em { color: #60a5fa; }
        .reg-subtext { color: rgba(255,255,255,0.6); font-size: 0.85rem; margin-bottom: 1.5rem; }
        .reg-step { color: rgba(255,255,255,0.4); font-size: 12px; margin-bottom: 1rem; }
        .reg-step.active { color: #60a5fa; }
      `}</style>

      <div className="reg-root">
        <div className="reg-card">
          <div className={`reg-step ${step === "login" ? "active" : ""}`}>Step 1: Login</div>
          <div className={`reg-step ${step === "profile" ? "active" : ""}`}>Step 2: Profile</div>

          <h1 className="reg-heading">
            {step === "login" ? (
              <><em>Welcome</em> back</>
            ) : (
              <>Complete your <em>profile</em></>
            )}
          </h1>

          <p className="reg-subtext">
            {step === "login"
              ? "Sign in using your Microsoft account"
              : "Fill your details to continue"}
          </p>

          {step === "login" && (
            <MicrosoftLogin onSuccess={handleLoginSuccess} />
          )}

          {step === "profile" && tokenData && (
            <CompleteProfile
              tokenData={tokenData}
              onComplete={handleProfileComplete}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default MSRegister;