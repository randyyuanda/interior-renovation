import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff, LockOutlined } from "@mui/icons-material";
import { useAuth } from "../../store/authStore";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from =
    (location.state as { from?: Location })?.from?.pathname ?? "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      }}
    >
      <Paper
        elevation={24}
        sx={{
          p: { xs: 3, sm: 5 },
          width: "100%",
          maxWidth: 420,
          mx: 2,
          borderRadius: 3,
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #e94560, #0f3460)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 32px rgba(233,69,96,0.4)",
            }}
          >
            <LockOutlined sx={{ color: "#fff", fontSize: 32 }} />
          </Box>
        </Box>

        <Typography
          variant="h4"
          fontWeight={700}
          textAlign="center"
          sx={{ color: "#fff", mb: 0.5 }}
        >
          Admin Portal
        </Typography>
        <Typography
          variant="body2"
          textAlign="center"
          sx={{ color: "rgba(255,255,255,0.5)", mb: 4 }}
        >
          Interior Renovation Management
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoFocus
            sx={{ mb: 2, ...glassMuiInput }}
          />
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((v) => !v)}
                    edge="end"
                    sx={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3, ...glassMuiInput }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontWeight: 700,
              fontSize: "1rem",
              textTransform: "none",
              background: "linear-gradient(135deg, #e94560, #c62a47)",
              boxShadow: "0 4px 20px rgba(233,69,96,0.4)",
              "&:hover": {
                background: "linear-gradient(135deg, #ff5c7a, #e94560)",
                boxShadow: "0 6px 28px rgba(233,69,96,0.6)",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#fff" }} />
            ) : (
              "Sign In"
            )}
          </Button>
        </Box>

        <Typography
          variant="caption"
          display="block"
          textAlign="center"
          sx={{ mt: 4, color: "rgba(255,255,255,0.3)" }}
        >
          © {new Date().getFullYear()} Randy Yuanda. All rights reserved.
        </Typography>
      </Paper>
    </Box>
  );
}

const glassMuiInput = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.4)" },
    "&.Mui-focused fieldset": { borderColor: "#e94560" },
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#e94560" },
  "& .MuiInputAdornment-root": { color: "rgba(255,255,255,0.5)" },
};
