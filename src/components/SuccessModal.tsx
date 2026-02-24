import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box,
  Zoom,
  alpha,
  useTheme,
} from "@mui/material";
import { CheckCircleOutline } from "@mui/icons-material";

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
}

export default function SuccessModal({
  open,
  onClose,
  title = "Success!",
  message = "Operation completed successfully.",
  buttonText = "Done",
}: SuccessModalProps) {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Zoom}
      PaperProps={{
        sx: {
          borderRadius: 4,
          padding: 2,
          textAlign: "center",
          maxWidth: 400,
          boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, 0.2)}`,
        },
      }}
    >
      <DialogContent sx={{ pb: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: alpha(theme.palette.success.main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 1,
            }}
          >
            <CheckCircleOutline
              sx={{ fontSize: 50, color: theme.palette.success.main }}
            />
          </Box>
          <Typography variant="h5" fontWeight={800} color="text.primary">
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {message}
          </Typography>
          <Button
            onClick={onClose}
            variant="contained"
            color="success"
            fullWidth
            sx={{
              mt: 2,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 700,
              fontSize: "1rem",
              textTransform: "none",
              boxShadow: `0 8px 16px ${alpha(theme.palette.success.main, 0.3)}`,
              "&:hover": {
                boxShadow: `0 12px 20px ${alpha(theme.palette.success.main, 0.4)}`,
              },
            }}
          >
            {buttonText}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
