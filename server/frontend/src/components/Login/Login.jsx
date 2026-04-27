import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, ArrowRight, X, AlertCircle, Loader2 } from 'lucide-react';
import "./Login.css";

const Login = ({ onClose }) => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(true);

  const login_url = window.location.origin + "/djangoapp/login";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(login_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "userName": userName,
          "password": password
        }),
      });

      const json = await res.json();
      if (json.status === "Authenticated") {
        sessionStorage.setItem('username', json.userName);
        setOpen(false);
      } else {
        setError("Invalid username or password. Please try again.");
      }
    } catch (err) {
      setError("Connection error. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <div className="login-page-wrapper">
      <div className="login-background">
        <div className="aurora-glow aurora-1" />
        <div className="aurora-glow aurora-2" />
        <div className="aurora-glow aurora-3" />
      </div>

      <AnimatePresence>
        {open && (
          <div className="login-modal-overlay">
            <motion.div 
              className="login-glass-card"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <button 
                className="close-btn" 
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <div className="login-content">
                <motion.div 
                  className="brand-section"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="brand-logo">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      🚗
                    </motion.div>
                  </div>
                  <h1>Welcome Back</h1>
                  <p>Log in to access your AutoSphere account</p>
                </motion.div>

                <form className="login-form" onSubmit={handleLogin}>
                  <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <div className="input-wrapper">
                      <User className="input-icon" size={18} />
                      <input 
                        id="username"
                        type="text" 
                        placeholder="Enter your username"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        required
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <div className="input-wrapper">
                      <Lock className="input-icon" size={18} />
                      <input 
                        id="password"
                        type="password" 
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
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
                  </AnimatePresence>

                  <motion.button 
                    className="login-submit-btn"
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </motion.button>
                </form>

                <div className="login-footer">
                  <span>Don't have an account?</span>
                  <a href="/register">Create one now</a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
