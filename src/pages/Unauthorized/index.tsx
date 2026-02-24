import { Box, Typography, Button, Paper } from '@mui/material';
import { GppBad, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        p: 2,
      }}
    >
      <Paper
        elevation={24}
        sx={{
          p: { xs: 4, sm: 6 },
          maxWidth: 420,
          textAlign: 'center',
          borderRadius: 3,
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(233,69,96,0.3)',
        }}
      >
        <GppBad sx={{ fontSize: 80, color: '#e94560', mb: 2 }} />
        <Typography variant="h3" fontWeight={800} sx={{ color: '#e94560', mb: 1 }}>
          403
        </Typography>
        <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', mb: 1.5 }}>
          Access Denied
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 4 }}>
          You don't have permission to access this page.
          Contact your administrator if you believe this is a mistake.
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{
            background: 'linear-gradient(135deg, #e94560, #c62a47)',
            textTransform: 'none',
            fontWeight: 700,
            px: 3,
            py: 1.2,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(233,69,96,0.4)',
            '&:hover': { background: 'linear-gradient(135deg, #ff5c7a, #e94560)' },
          }}
        >
          Go Back
        </Button>
      </Paper>
    </Box>
  );
}
