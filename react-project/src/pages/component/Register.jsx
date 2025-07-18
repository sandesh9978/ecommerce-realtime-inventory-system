import { useState } from "react";
import { toast } from "react-toastify";
import { createUserApi } from "../api";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const termsText = "Your Terms of Use content goes here...";
  const privacyText = "Your Privacy Policy content goes here...";

  const submit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      return toast.error("Please fill out all fields");
    }
    if (!agreed) {
      return toast.error("You must agree to the Terms of Use and Privacy Policy");
    }

    try {
      const formData = new FormData();
      formData.append("userName", name);
      formData.append("email", email);
      formData.append("password", password);

      const response = await createUserApi(formData);

      if (response.data.success) {
        toast.success(response.data.message);
        setName("");
        setEmail("");
        setPassword("");
        setAgreed(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.error("Error creating user:", err);
      toast.error("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <form onSubmit={submit} className="bg-gray-300 p-4 rounded space-y-3">
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="block w-full p-2 rounded"
        />
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="block w-full p-2 rounded"
        />
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="block w-full p-2 rounded"
        />
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
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full disabled:opacity-50"
          disabled={!agreed}
        >
          Register
        </button>
      </form>

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

      <div className="mt-6 bg-white p-4 rounded shadow">
        <p className="font-bold mb-1">Live Preview:</p>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Email:</strong> {email}</p>
      </div>
    </div>
  );
};

export default Register;