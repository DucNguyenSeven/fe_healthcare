"use client";

import React, { useEffect, useState } from "react";
import { Snackbar, Alert } from "@mui/material";

interface MessageNotifierProps {
  messageKey: string;
  autoHideDuration?: number;
}

export const MessageNotifier: React.FC<MessageNotifierProps> = ({
  messageKey,
  autoHideDuration = 6000,
}) => {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check for message in sessionStorage on component mount
    const storedMessage = sessionStorage.getItem(messageKey);
    if (storedMessage) {
      setMessage(storedMessage);
      // Remove message from sessionStorage to prevent showing again
      sessionStorage.removeItem(messageKey);
    }
  }, [messageKey]);

  const handleClose = () => {
    setMessage(null);
  };

  return (
    <Snackbar
      open={!!message}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default MessageNotifier;
