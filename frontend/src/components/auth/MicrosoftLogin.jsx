import { useMsal } from "@azure/msal-react";
import { useAuth } from "../../context";

const MicrosoftLogin = ({ onSuccess }) => {
  const { instance } = useMsal();
  const { microsoftLogin } = useAuth();

  const handleLogin = async () => {
    try {
      const response = await instance.loginPopup({
        scopes: ["user.read"],
        prompt: "select_account",
      });

      const email = response.account.username;
      const idToken = response.idToken;

      const result = await microsoftLogin(idToken);

      onSuccess({
        isNewUser: result.isNewUser,
        user: result.user,
        idToken,
        email,
      });

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <style>{`
        .ms-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: rgba(59,130,246,0.15);
          border: 1px solid rgba(96,165,250,0.3);
          border-radius: 14px;
          padding: 14px;
          color: #e0f2fe;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.25s;
        }

        .ms-btn:hover {
          background: rgba(59,130,246,0.25);
          border-color: rgba(96,165,250,0.5);
          box-shadow: 0 8px 32px rgba(37,99,235,0.4);
        }
      `}</style>

      <button onClick={handleLogin} className="ms-btn">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
          className="w-5 h-5"
        />
        Continue with Microsoft
      </button>
    </>
  );
};

export default MicrosoftLogin;