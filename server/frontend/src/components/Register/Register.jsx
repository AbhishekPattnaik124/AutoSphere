import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, ArrowRight, X, AlertCircle, Loader2, Sparkles } from "lucide-react";
import "./Register.css";

const Register = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const register_url = window.location.origin + "/djangoapp/register";

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(register_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "userName": userName,
          "password": password,
          "firstName": firstName,
          "lastName": lastName,
          "email": email
        }),
      });

      const json = await res.json();
      if (json.status) {
        sessionStorage.setItem('username', json.userName);
        setSuccess(true);
        setTimeout(() => {
          window.location.href = window.location.origin;
        }, 1500);
      } else if (json.error === "Already Registered") {
        setError("This username is already taken. Please choose another.");
      } else {
        setError("Registration failed. Please check your details.");
      }
    } catch (err) {
      setError("Connection error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => {
    window.location.href = window.location.origin;
  };

  return (
    <div className="register-page-wrapper">
      <div className="register-background">
        <div className="aurora-glow aurora-1" />
        <div className="aurora-glow aurora-2" />
        <div className="aurora-glow aurora-3" />
      </div>

      <div className="register-container">
        <motion.div 
          className="register-glass-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
          <button className="close-btn" onClick={goHome}>
            <X size={20} />
          </button>

          <div className="register-content">
            <motion.div 
              className="register-header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="icon-badge">
                <Sparkles className="sparkle-icon" size={24} />
              </div>
              <h1>Join AutoSphere</h1>
              <p>Experience the future of automotive management</p>
            </motion.div>

            <form className="register-form" onSubmit={handleRegister}>
              <div className="name-row">
                <div className="input-group">
                  <label>First Name</label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={16} />
                    <input 
                      type="text" 
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label>Last Name</label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={16} />
                    <input 
                      type="text" 
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label>Username</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={16} />
                  <input 
                    type="text" 
                    placeholder="johndoe123"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={16} />
                  <input 
                    type="email" 
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={16} />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    className="error-message"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </motion.div>
                )}
                {success && (
                  <motion.div 
                    className="success-message"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <div className="success-dot" />
                    <span>Success! Welcome to the club.</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button 
                className={`register-submit-btn ${success ? 'success' : ''}`}
                type="submit"
                disabled={loading || success}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : success ? (
                  <span>Redirecting...</span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </form>

            <div className="register-footer">
              <span>Already a member?</span>
              <a href="/login">Sign in here</a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
