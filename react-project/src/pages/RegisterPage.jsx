import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { isValidPassword } from "../utils/validators";

function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");
  const [adminSecret, setAdminSecret] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [ageModalOpen, setAgeModalOpen] = useState(false);
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(false);

  const navigate = useNavigate();

  const maxDob = new Date().toISOString().split("T")[0]; // today YYYY-MM-DD

  // Password rules for live checklist
  const allowedSymbols = "~.!@#$%^&*<>";
  const passwordRules = [
    {
      label: "8-20 characters",
      test: (pw) => pw.length >= 8 && pw.length <= 20,
    },
    {
      label: "At least one letter",
      test: (pw) => /[a-zA-Z]/.test(pw),
    },
    {
      label: "At least one number",
      test: (pw) => /\d/.test(pw),
    },
    {
      label: `At least one special character (${allowedSymbols})`,
      test: (pw) => new RegExp(`[${allowedSymbols.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')}]`).test(pw),
    },
    {
      label: `Only these symbols allowed: ${allowedSymbols}`,
      test: (pw) => !/[^a-zA-Z0-9~.!@#$%^&*<>]/.test(pw),
    },
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Password requirements validation
    if (!isValidPassword(password)) {
      setError("Password must be 8-20 characters, include at least one letter, one number, and one special character (~.!@#$%^&*<>), and only allowed symbols.");
      return;
    }

    // Age validation: must be at least 18 years old
    if (dob) {
      const dobDate = new Date(dob);
      const today = new Date();
      const age = today.getFullYear() - dobDate.getFullYear();
      const m = today.getMonth() - dobDate.getMonth();
      const isBirthdayPassed = m > 0 || (m === 0 && today.getDate() >= dobDate.getDate());
      const actualAge = isBirthdayPassed ? age : age - 1;
      if (actualAge < 18) {
        setAgeModalOpen(true);
        return;
      }
    }

    // Basic validations
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (role === "admin" && !adminSecret.trim()) {
      setError("Admin secret is required for admin role");
      return;
    }

    if (!fullName.trim()) {
      setError("Full name is required");
      return;
    }

    if (!dob) {
      setError("Date of birth is required");
      return;
    }

    if (dob > maxDob) {
      setError("Date of birth cannot be in the future");
      return;
    }

    if (!agreed) {
      setError("You must agree to the Terms of Use and Privacy Policy");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          dob,
          email: email.trim(),
          password,
          role,
          adminSecret: adminSecret.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.message && data.message.toLowerCase().includes('user already exists')) {
          setError('An account with this email already exists. Please use a different email or log in.');
        } else {
          setError(data.message || "Registration failed");
        }
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setWelcomeModalOpen(true);
      // navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch {
      setError("Server error during registration");
    } finally {
      setLoading(false);
    }
  };

  const termsText = `Terms of Use\nEffective Date: [Insert Date]\nWelcome to our platform Sandesh Store. These Terms of Use (“Terms”) govern your use of our website, user dashboard, and related services (collectively, the “Platform”). By accessing or using our Platform, you agree to comply with and be bound by these Terms.\nIf you do not agree with these Terms, do not access or use the Platform.\n________________________________________\n1. Eligibility\nTo use this Platform, you must:\n• Be at least 18 years old or the age of majority in your jurisdiction;\n• Have the legal capacity to enter into a binding agreement;\n• Agree to use the Platform in accordance with all applicable laws and regulations.\n________________________________________\n2. Account Registration\nTo access certain features, you may be required to create an account. You agree to:\n• Provide accurate, complete, and current information;\n• Maintain the confidentiality of your login credentials;\n• Notify us immediately of any unauthorized access or use of your account.\nYou are responsible for all activities that occur under your account.\n________________________________________\n3. Use of the Platform\nYou agree not to:\n• Use the Platform for unlawful, harmful, or fraudulent activities;\n• Attempt to gain unauthorized access to other users' accounts or data;\n• Disrupt or interfere with the security, functionality, or performance of the Platform;\n• Upload or transmit malware, spam, or any harmful content.\nWe reserve the right to suspend or terminate your account for violations of these Terms.\n________________________________________\n4. Intellectual Property\nAll content, including but not limited to text, graphics, logos, software, and user interface elements, is the property of [Your Company Name] or its licensors and protected under copyright and trademark laws.\nYou may not copy, reproduce, distribute, or create derivative works without our prior written consent.\n________________________________________\n5. Privacy\nYour use of the Platform is also governed by our [Privacy Policy], which explains how we collect, use, and protect your personal information.\n________________________________________\n6. Termination\nWe may suspend or terminate your access to the Platform at our sole discretion, without notice, if we believe you have violated these Terms or engaged in any misconduct.\nUpon termination, your right to access or use the Platform will immediately cease.\n________________________________________\n7. Disclaimers\nThe Platform is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that:\n• The Platform will be uninterrupted, secure, or error-free;\n• Any content or data is accurate, reliable, or current.\n________________________________________\n8. Limitation of Liability\nTo the fullest extent permitted by law, [Your Company Name] shall not be liable for:\n• Any indirect, incidental, special, or consequential damages;\n• Loss of profits, data, goodwill, or other intangible losses;\n• Any damage resulting from unauthorized access, use, or alteration of your data.\n________________________________________\n9. Changes to Terms\nWe reserve the right to modify these Terms at any time. Updated Terms will be posted on this page with an updated “Effective Date.” Continued use of the Platform after changes constitutes acceptance of the revised Terms.\n________________________________________\n10. Governing Law\nThese Terms shall be governed by and construed in accordance with the laws of Government of Nepal, without regard to its conflict of law principles.\n________________________________________\n11. Contact Us\nFor questions or concerns regarding these Terms, please contact us at:\n📧 Email: sandesh@gmail.com\n🌐 Website: sandesh.com \n`;
  const privacyText = `Privacy and Confidentiality\nWelcome to the Sandesh Store dashboard platform, operated by Sandesh Pantha. We value your trust and are committed to protecting your personal information. Please read this Privacy Policy carefully to understand how we handle your data.\nThis Privacy Policy describes how we collect, use, and (under certain conditions) disclose your personal information. It also outlines the steps we take to safeguard your information and your options regarding its collection, use, and disclosure. By accessing or using the Platform, you agree to the practices described in this Privacy Policy.\n________________________________________\nData Collection and Usage\nWe collect, store, and use your information to provide our services, process transactions, enhance your user experience, and comply with legal obligations. The personal data collected may include:\n• Full Name\n• Date of Birth\n• Email Address\n• Password (encrypted)\n• Role (e.g., user, admin)\n• IP address, browser type, and device details\n• Profile preferences and uploaded content\nYou may also provide information voluntarily when interacting with features such as forms, profile updates, or image uploads.\n________________________________________\nHow We Use Your Data\nWe use your information for purposes including but not limited to:\n• Account registration and user authentication\n• Secure access and profile personalization\n• Order management and notifications\n• Platform improvements and customer service\n• Compliance with legal and regulatory requirements\n________________________________________\nData Retention\nWe retain your personal data only as long as necessary for the purposes stated in this Policy or to meet legal, regulatory, or operational requirements. Once data is no longer needed, we will securely delete or anonymize it.\n________________________________________\nCookies and Tracking\nWe use cookies and similar technologies to:\n• Recognize returning users\n• Improve navigation and user experience\n• Analyze platform performance\nYou can manage cookie settings through your browser.\n________________________________________\nThird-Party Services\nWe may share your data with service providers for tasks such as:\n• Payment processing\n• Email delivery\n• Cloud storage\n• Analytics and performance monitoring\nThese providers are contractually obligated to protect your data.\n________________________________________\nUser Rights and Choices\nYou have the right to:\n• Access and review your personal data\n• Request corrections or updates\n• Withdraw consent and request data deletion\n• Opt-out of marketing communications\nTo exercise these rights, contact our support team at [support@estorefront.com].\n________________________________________\nSecurity Measures\nWe employ strong technical and organizational measures to protect your data, including:\n• Data encryption\n• Access controls\n• Regular audits and vulnerability assessments\nHowever, no online service can be guaranteed 100% secure.\n________________________________________\nChildren’s Privacy\nThis Platform is not intended for users under 18. We do not knowingly collect personal data from minors. If we become aware of such data, we will delete it immediately.\n________________________________________\nPolicy Updates\nWe may update this Privacy Policy to reflect changes in our practices or legal requirements. Updates will be posted on this page with an updated revision date.\n________________________________________\nContact Us\nIf you have questions or concerns about this Privacy Policy or our data practices, please contact:\nEmail: sandesh@gmial.com\nWebsite: Sandesh.com\nAddress: Kathmandu, Nepal\n________________________________________\nBy using our Platform, you acknowledge that you have read, understood, and agreed to this Privacy Policy.`;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      {/* Age Restriction Modal */}
      {ageModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative text-center">
            <div className="text-4xl mb-2">🚫</div>
            <h3 className="text-xl font-bold mb-2">Access Denied: Age Restriction</h3>
            <p className="mb-2">You must be at least 18 years old to use this platform.<br/>If you are under 18, access is restricted.</p>
            <p className="mb-4">👉 If you believe this is an error or you require access for a valid reason,<br/>please contact the administrator at: <a href="mailto:sandesh@gmail.com" className="text-blue-600 underline">sandesh@gmail.com</a></p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold"
              onClick={() => setAgeModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Welcome Modal */}
      {welcomeModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative text-center">
            <div className="text-4xl mb-2">✅</div>
            <h3 className="text-2xl font-bold mb-2">Welcome to Sandesh Store</h3>
            <p className="mb-4">Thank you for registering with us. Your account has been successfully created.<br/><br/>
            We’re thrilled to have you on board! You can now:</p>
            <ul className="text-left mb-4 space-y-2">
              <li>🔒 Securely log in and access your personalized dashboard</li>
              <li>🛒 Browse and purchase our products and services</li>
              <li>🧾 Track your orders and manage your profile with ease</li>
              <li>📬 Stay informed about our latest features, offers, and updates</li>
            </ul>
            <p className="mb-4">If you have any questions or need assistance, don’t hesitate to reach out to us at <a href="mailto:support@estorefront.com" className="text-blue-600 underline">support@estorefront.com</a></p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold mb-2"
              onClick={() => { setWelcomeModalOpen(false); navigate('/login'); }}
            >
              👉 Login Now
            </button>
            <div className="mt-2 text-gray-700">Welcome to the Sandesh Store community — let’s get started!</div>
          </div>
        </div>
      )}
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">🔐 Register</h2>

        {error && (
          <p className="text-red-600 mb-4 font-semibold" role="alert">
            {error}
          </p>
        )}

        <label htmlFor="fullName" className="block mb-2 font-semibold">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          className="w-full p-3 border rounded mb-4"
          placeholder="Your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          autoComplete="name"
        />

        <label htmlFor="dob" className="block mb-2 font-semibold">
          Date of Birth
        </label>
        <input
          id="dob"
          type="date"
          className="w-full p-3 border rounded mb-4"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          required
          max={maxDob}
        />

        <label htmlFor="email" className="block mb-2 font-semibold">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="w-full p-3 border rounded mb-4"
          placeholder="youremail@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <label htmlFor="password" className="block mb-2 font-semibold">
          Password
        </label>
        <div className="relative mb-1">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            className="w-full p-3 border rounded pr-10"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            maxLength={20}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="absolute top-3 right-3 text-gray-600"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {/* Live password checklist */}
        <ul className="text-xs mb-4 ml-1 list-disc list-inside">
          {passwordRules.map((rule, idx) => {
            const passed = rule.test(password);
            return (
              <li key={rule.label} className="flex items-center">
                <span className={`mr-2 ${passed ? "text-green-600" : "text-gray-400"}`}>{passed ? "✔" : "✖"}</span>
                {rule.label}
              </li>
            );
          })}
        </ul>

        <label htmlFor="confirmPassword" className="block mb-2 font-semibold">
          Confirm Password
        </label>
        <div className="relative mb-4">
          <input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            className="w-full p-3 border rounded pr-10"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="absolute top-3 right-3 text-gray-600"
            onClick={() => setShowConfirm((prev) => !prev)}
            tabIndex={-1}
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <label htmlFor="role" className="block mb-2 font-semibold">
          Role
        </label>
        <select
          id="role"
          className="w-full p-3 border rounded mb-6"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        {role === "admin" && (
          <>
            <label htmlFor="adminSecret" className="block mb-2 font-semibold">
              Admin Secret
            </label>
            <div className="relative mb-6">
              <input
                id="adminSecret"
                type={showSecret ? "text" : "password"}
                className="w-full p-3 border rounded pr-10"
                placeholder="Enter admin secret"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                required
                autoComplete="off"
              />
              <button
                type="button"
                className="absolute top-3 right-3 text-gray-600"
                onClick={() => setShowSecret((prev) => !prev)}
                tabIndex={-1}
                aria-label={showSecret ? "Hide admin secret" : "Show admin secret"}
              >
                {showSecret ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </>
        )}

        {/* Terms and Privacy Policy Agreement */}
        <label className="flex items-center space-x-2 text-sm mb-4">
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="form-checkbox"
            required
          />
          <span>
            By creating and/or using your account, you agree to our
            <button
              type="button"
              className="text-blue-600 underline mx-1"
              onClick={() => { setModalTitle("Terms of Use"); setModalContent(termsText); setModalOpen(true); }}
            >
              Terms of Use
            </button>
            and
            <button
              type="button"
              className="text-blue-600 underline mx-1"
              onClick={() => { setModalTitle("Privacy Policy"); setModalContent(privacyText); setModalOpen(true); }}
            >
              Privacy Policy
            </button>.
          </span>
        </label>

        {/* Modal for Terms/Privacy */}
        {modalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
              <h3 className="text-xl font-bold mb-4">{modalTitle}</h3>
              <div className="max-h-96 overflow-y-auto whitespace-pre-line text-gray-700">{modalContent}</div>
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !agreed}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50 transition font-semibold text-lg"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Eye, EyeOff } from "lucide-react";
// import { isValidPassword } from "../utils/validators";

// function RegisterPage() {
//   const [fullName, setFullName] = useState("");
//   const [dob, setDob] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [role, setRole] = useState("user");
//   const [adminSecret, setAdminSecret] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [showSecret, setShowSecret] = useState(false);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [agreed, setAgreed] = useState(false);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [modalContent, setModalContent] = useState("");
//   const [modalTitle, setModalTitle] = useState("");
//   const [ageModalOpen, setAgeModalOpen] = useState(false);
//   const [welcomeModalOpen, setWelcomeModalOpen] = useState(false);

//   const navigate = useNavigate();

//   const maxDob = new Date().toISOString().split("T")[0]; // today YYYY-MM-DD

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setError("");

//     // Password requirements validation
//     if (!isValidPassword(password)) {
//       setError("Password must be 8-20 characters, include at least one letter, one number, and one special character (~.!@#$%^&*<>), and only allowed symbols.");
//       return;
//     }

//     // Age validation: must be at least 18 years old
//     if (dob) {
//       const dobDate = new Date(dob);
//       const today = new Date();
//       const age = today.getFullYear() - dobDate.getFullYear();
//       const m = today.getMonth() - dobDate.getMonth();
//       const isBirthdayPassed = m > 0 || (m === 0 && today.getDate() >= dobDate.getDate());
//       const actualAge = isBirthdayPassed ? age : age - 1;
//       if (actualAge < 18) {
//         setAgeModalOpen(true);
//         return;
//       }
//     }

//     // Basic validations
//     if (password !== confirmPassword) {
//       setError("Passwords do not match");
//       return;
//     }

//     if (role === "admin" && !adminSecret.trim()) {
//       setError("Admin secret is required for admin role");
//       return;
//     }

//     if (!fullName.trim()) {
//       setError("Full name is required");
//       return;
//     }

//     if (!dob) {
//       setError("Date of birth is required");
//       return;
//     }

//     if (dob > maxDob) {
//       setError("Date of birth cannot be in the future");
//       return;
//     }

//     if (!agreed) {
//       setError("You must agree to the Terms of Use and Privacy Policy");
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await fetch("http://localhost:5000/api/auth/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           fullName: fullName.trim(),
//           dob,
//           email: email.trim(),
//           password,
//           role,
//           adminSecret: adminSecret.trim(),
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         if (data.message && data.message.toLowerCase().includes('user already exists')) {
//           setError('An account with this email already exists. Please use a different email or log in.');
//         } else {
//           setError(data.message || "Registration failed");
//         }
//         return;
//       }

//       localStorage.setItem("token", data.token);
//       localStorage.setItem("user", JSON.stringify(data.user));

//       setWelcomeModalOpen(true);
//       // navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
//     } catch {
//       setError("Server error during registration");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const termsText = `Terms of Use\nEffective Date: [Insert Date]\nWelcome to our platform Sandesh Store. These Terms of Use (“Terms”) govern your use of our website, user dashboard, and related services (collectively, the “Platform”). By accessing or using our Platform, you agree to comply with and be bound by these Terms.\nIf you do not agree with these Terms, do not access or use the Platform.\n________________________________________\n1. Eligibility\nTo use this Platform, you must:\n• Be at least 18 years old or the age of majority in your jurisdiction;\n• Have the legal capacity to enter into a binding agreement;\n• Agree to use the Platform in accordance with all applicable laws and regulations.\n________________________________________\n2. Account Registration\nTo access certain features, you may be required to create an account. You agree to:\n• Provide accurate, complete, and current information;\n• Maintain the confidentiality of your login credentials;\n• Notify us immediately of any unauthorized access or use of your account.\nYou are responsible for all activities that occur under your account.\n________________________________________\n3. Use of the Platform\nYou agree not to:\n• Use the Platform for unlawful, harmful, or fraudulent activities;\n• Attempt to gain unauthorized access to other users' accounts or data;\n• Disrupt or interfere with the security, functionality, or performance of the Platform;\n• Upload or transmit malware, spam, or any harmful content.\nWe reserve the right to suspend or terminate your account for violations of these Terms.\n________________________________________\n4. Intellectual Property\nAll content, including but not limited to text, graphics, logos, software, and user interface elements, is the property of [Your Company Name] or its licensors and protected under copyright and trademark laws.\nYou may not copy, reproduce, distribute, or create derivative works without our prior written consent.\n________________________________________\n5. Privacy\nYour use of the Platform is also governed by our [Privacy Policy], which explains how we collect, use, and protect your personal information.\n________________________________________\n6. Termination\nWe may suspend or terminate your access to the Platform at our sole discretion, without notice, if we believe you have violated these Terms or engaged in any misconduct.\nUpon termination, your right to access or use the Platform will immediately cease.\n________________________________________\n7. Disclaimers\nThe Platform is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that:\n• The Platform will be uninterrupted, secure, or error-free;\n• Any content or data is accurate, reliable, or current.\n________________________________________\n8. Limitation of Liability\nTo the fullest extent permitted by law, [Your Company Name] shall not be liable for:\n• Any indirect, incidental, special, or consequential damages;\n• Loss of profits, data, goodwill, or other intangible losses;\n• Any damage resulting from unauthorized access, use, or alteration of your data.\n________________________________________\n9. Changes to Terms\nWe reserve the right to modify these Terms at any time. Updated Terms will be posted on this page with an updated “Effective Date.” Continued use of the Platform after changes constitutes acceptance of the revised Terms.\n________________________________________\n10. Governing Law\nThese Terms shall be governed by and construed in accordance with the laws of Government of Nepal, without regard to its conflict of law principles.\n________________________________________\n11. Contact Us\nFor questions or concerns regarding these Terms, please contact us at:\n📧 Email: sandesh@gmail.com\n🌐 Website: sandesh.com \n`;
//   const privacyText = `Privacy and Confidentiality\nWelcome to the Sandesh Store dashboard platform, operated by Sandesh Pantha. We value your trust and are committed to protecting your personal information. Please read this Privacy Policy carefully to understand how we handle your data.\nThis Privacy Policy describes how we collect, use, and (under certain conditions) disclose your personal information. It also outlines the steps we take to safeguard your information and your options regarding its collection, use, and disclosure. By accessing or using the Platform, you agree to the practices described in this Privacy Policy.\n________________________________________\nData Collection and Usage\nWe collect, store, and use your information to provide our services, process transactions, enhance your user experience, and comply with legal obligations. The personal data collected may include:\n• Full Name\n• Date of Birth\n• Email Address\n• Password (encrypted)\n• Role (e.g., user, admin)\n• IP address, browser type, and device details\n• Profile preferences and uploaded content\nYou may also provide information voluntarily when interacting with features such as forms, profile updates, or image uploads.\n________________________________________\nHow We Use Your Data\nWe use your information for purposes including but not limited to:\n• Account registration and user authentication\n• Secure access and profile personalization\n• Order management and notifications\n• Platform improvements and customer service\n• Compliance with legal and regulatory requirements\n________________________________________\nData Retention\nWe retain your personal data only as long as necessary for the purposes stated in this Policy or to meet legal, regulatory, or operational requirements. Once data is no longer needed, we will securely delete or anonymize it.\n________________________________________\nCookies and Tracking\nWe use cookies and similar technologies to:\n• Recognize returning users\n• Improve navigation and user experience\n• Analyze platform performance\nYou can manage cookie settings through your browser.\n________________________________________\nThird-Party Services\nWe may share your data with service providers for tasks such as:\n• Payment processing\n• Email delivery\n• Cloud storage\n• Analytics and performance monitoring\nThese providers are contractually obligated to protect your data.\n________________________________________\nUser Rights and Choices\nYou have the right to:\n• Access and review your personal data\n• Request corrections or updates\n• Withdraw consent and request data deletion\n• Opt-out of marketing communications\nTo exercise these rights, contact our support team at [support@estorefront.com].\n________________________________________\nSecurity Measures\nWe employ strong technical and organizational measures to protect your data, including:\n• Data encryption\n• Access controls\n• Regular audits and vulnerability assessments\nHowever, no online service can be guaranteed 100% secure.\n________________________________________\nChildren’s Privacy\nThis Platform is not intended for users under 18. We do not knowingly collect personal data from minors. If we become aware of such data, we will delete it immediately.\n________________________________________\nPolicy Updates\nWe may update this Privacy Policy to reflect changes in our practices or legal requirements. Updates will be posted on this page with an updated revision date.\n________________________________________\nContact Us\nIf you have questions or concerns about this Privacy Policy or our data practices, please contact:\nEmail: sandesh@gmial.com\nWebsite: Sandesh.com\nAddress: Kathmandu, Nepal\n________________________________________\nBy using our Platform, you acknowledge that you have read, understood, and agreed to this Privacy Policy.`;

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
//       {/* Age Restriction Modal */}
//       {ageModalOpen && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//           <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative text-center">
//             <div className="text-4xl mb-2">🚫</div>
//             <h3 className="text-xl font-bold mb-2">Access Denied: Age Restriction</h3>
//             <p className="mb-2">You must be at least 18 years old to use this platform.<br/>If you are under 18, access is restricted.</p>
//             <p className="mb-4">👉 If you believe this is an error or you require access for a valid reason,<br/>please contact the administrator at: <a href="mailto:sandesh@gmail.com" className="text-blue-600 underline">sandesh@gmail.com</a></p>
//             <button
//               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold"
//               onClick={() => setAgeModalOpen(false)}
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}
//       {/* Welcome Modal */}
//       {welcomeModalOpen && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//           <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative text-center">
//             <div className="text-4xl mb-2">✅</div>
//             <h3 className="text-2xl font-bold mb-2">Welcome to Sandesh Store</h3>
//             <p className="mb-4">Thank you for registering with us. Your account has been successfully created.<br/><br/>
//             We’re thrilled to have you on board! You can now:</p>
//             <ul className="text-left mb-4 space-y-2">
//               <li>🔒 Securely log in and access your personalized dashboard</li>
//               <li>🛒 Browse and purchase our products and services</li>
//               <li>🧾 Track your orders and manage your profile with ease</li>
//               <li>📬 Stay informed about our latest features, offers, and updates</li>
//             </ul>
//             <p className="mb-4">If you have any questions or need assistance, don’t hesitate to reach out to us at <a href="mailto:support@estorefront.com" className="text-blue-600 underline">support@estorefront.com</a></p>
//             <button
//               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold mb-2"
//               onClick={() => { setWelcomeModalOpen(false); navigate('/login'); }}
//             >
//               👉 Login Now
//             </button>
//             <div className="mt-2 text-gray-700">Welcome to the Sandesh Store community — let’s get started!</div>
//           </div>
//         </div>
//       )}
//       <form
//         onSubmit={handleRegister}
//         className="bg-white p-8 rounded shadow-md w-full max-w-md"
//       >
//         <h2 className="text-3xl font-bold mb-6 text-center">🔐 Register</h2>

//         {error && (
//           <p className="text-red-600 mb-4 font-semibold" role="alert">
//             {error}
//           </p>
//         )}

//         <label htmlFor="fullName" className="block mb-2 font-semibold">
//           Full Name
//         </label>
//         <input
//           id="fullName"
//           type="text"
//           className="w-full p-3 border rounded mb-4"
//           placeholder="Your full name"
//           value={fullName}
//           onChange={(e) => setFullName(e.target.value)}
//           required
//           autoComplete="name"
//         />

//         <label htmlFor="dob" className="block mb-2 font-semibold">
//           Date of Birth
//         </label>
//         <input
//           id="dob"
//           type="date"
//           className="w-full p-3 border rounded mb-4"
//           value={dob}
//           onChange={(e) => setDob(e.target.value)}
//           required
//           max={maxDob}
//         />

//         <label htmlFor="email" className="block mb-2 font-semibold">
//           Email
//         </label>
//         <input
//           id="email"
//           type="email"
//           className="w-full p-3 border rounded mb-4"
//           placeholder="example@mail.com"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//           autoComplete="email"
//         />

//         <label htmlFor="password" className="block mb-2 font-semibold">
//           Password
//         </label>
//         <div className="relative mb-1">
//           <input
//             id="password"
//             type={showPassword ? "text" : "password"}
//             className="w-full p-3 border rounded pr-10"
//             placeholder="Enter password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//             minLength={8}
//             maxLength={20}
//             autoComplete="new-password"
//           />
//           <button
//             type="button"
//             className="absolute top-3 right-3 text-gray-600"
//             onClick={() => setShowPassword((prev) => !prev)}
//             tabIndex={-1}
//             aria-label={showPassword ? "Hide password" : "Show password"}
//           >
//             {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//           </button>
//         </div>
//         <ul className="text-xs text-gray-600 mb-4 ml-1 list-disc list-inside">
//           <li>Password must be 8-20 characters</li>
//           <li>Include at least one letter, one number, and one special character (~.!@#$%^&amp;*&lt;&gt;)</li>
//           <li>Only these symbols allowed: ~.!@#$%^&amp;*&lt;&gt;</li>
//         </ul>

//         <label htmlFor="confirmPassword" className="block mb-2 font-semibold">
//           Confirm Password
//         </label>
//         <div className="relative mb-4">
//           <input
//             id="confirmPassword"
//             type={showConfirm ? "text" : "password"}
//             className="w-full p-3 border rounded pr-10"
//             placeholder="Re-enter password"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             required
//             minLength={6}
//             autoComplete="new-password"
//           />
//           <button
//             type="button"
//             className="absolute top-3 right-3 text-gray-600"
//             onClick={() => setShowConfirm((prev) => !prev)}
//             tabIndex={-1}
//             aria-label={showConfirm ? "Hide password" : "Show password"}
//           >
//             {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
//           </button>
//         </div>

//         <label htmlFor="role" className="block mb-2 font-semibold">
//           Role
//         </label>
//         <select
//           id="role"
//           className="w-full p-3 border rounded mb-6"
//           value={role}
//           onChange={(e) => setRole(e.target.value)}
//         >
//           <option value="user">User</option>
//           <option value="admin">Admin</option>
//         </select>

//         {role === "admin" && (
//           <>
//             <label htmlFor="adminSecret" className="block mb-2 font-semibold">
//               Admin Secret
//             </label>
//             <div className="relative mb-6">
//               <input
//                 id="adminSecret"
//                 type={showSecret ? "text" : "password"}
//                 className="w-full p-3 border rounded pr-10"
//                 placeholder="Enter admin secret"
//                 value={adminSecret}
//                 onChange={(e) => setAdminSecret(e.target.value)}
//                 required
//                 autoComplete="off"
//               />
//               <button
//                 type="button"
//                 className="absolute top-3 right-3 text-gray-600"
//                 onClick={() => setShowSecret((prev) => !prev)}
//                 tabIndex={-1}
//                 aria-label={showSecret ? "Hide admin secret" : "Show admin secret"}
//               >
//                 {showSecret ? <EyeOff size={20} /> : <Eye size={20} />}
//               </button>
//             </div>
//           </>
//         )}

//         {/* Terms and Privacy Policy Agreement */}
//         <label className="flex items-center space-x-2 text-sm mb-4">
//           <input
//             type="checkbox"
//             checked={agreed}
//             onChange={e => setAgreed(e.target.checked)}
//             className="form-checkbox"
//             required
//           />
//           <span>
//             By creating and/or using your account, you agree to our
//             <button
//               type="button"
//               className="text-blue-600 underline mx-1"
//               onClick={() => { setModalTitle("Terms of Use"); setModalContent(termsText); setModalOpen(true); }}
//             >
//               Terms of Use
//             </button>
//             and
//             <button
//               type="button"
//               className="text-blue-600 underline mx-1"
//               onClick={() => { setModalTitle("Privacy Policy"); setModalContent(privacyText); setModalOpen(true); }}
//             >
//               Privacy Policy
//             </button>.
//           </span>
//         </label>

//         {/* Modal for Terms/Privacy */}
//         {modalOpen && (
//           <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//             <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
//               <h3 className="text-xl font-bold mb-4">{modalTitle}</h3>
//               <div className="max-h-96 overflow-y-auto whitespace-pre-line text-gray-700">{modalContent}</div>
//               <button
//                 className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
//                 onClick={() => setModalOpen(false)}
//                 aria-label="Close"
//               >
//                 &times;
//               </button>
//             </div>
//           </div>
//         )}

//         <button
//           type="submit"
//           disabled={loading || !agreed}
//           className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50 transition font-semibold text-lg"
//         >
//           {loading ? "Registering..." : "Register"}
//         </button>
//       </form>
//     </div>
//   );
// }

// export default RegisterPage;
