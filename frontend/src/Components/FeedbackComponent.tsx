import { Snackbar } from "@mui/material";
import { Alert } from "@mui/material";

interface FeedbackComponentProps {
  message: string;
  severity: "success" | "error" | "warning" | "info";
  open: boolean;
  handleClose: () => void;
}

export default function FeedbackComponent({
  message,
  severity,
  open,
  handleClose,
}: FeedbackComponentProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        severity={severity}
        onClose={handleClose}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
