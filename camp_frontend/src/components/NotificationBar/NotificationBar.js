import React, { createContext, useContext, useState, useCallback } from "react";

// PUBLIC_INTERFACE
/**
 * NotificationContext allows global access to show notifications from anywhere in the app.
 */
const NotificationContext = createContext();

/**
 * PUBLIC_INTERFACE
 * Provider for NotificationContext. Should wrap the app in App.js.
 */
export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  // Show a new notification with message, type and optional auto-dismiss.
  const showNotification = useCallback(({ message, type = "info", duration = 4000 }) => {
    setNotification({ message, type });
    if (duration > 0) {
      setTimeout(() => setNotification(null), duration);
    }
  }, []);

  // PUBLIC_INTERFACE
  const value = { showNotification };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationBar notification={notification} onClose={() => setNotification(null)} />
    </NotificationContext.Provider>
  );
}

/**
 * PUBLIC_INTERFACE
 * Custom hook to access showNotification function from any component.
 */
export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context.showNotification;
}

/**
 * Styled notification bar/snackbar that appears at the bottom of the screen.
 */
function NotificationBar({ notification, onClose }) {
  if (!notification) return null;

  const { message, type } = notification;
  let bgColor = "#323232";
  if (type === "success") bgColor = "#388e3c";
  if (type === "error") bgColor = "#d32f2f";
  if (type === "warning") bgColor = "#ff9800";
  if (type === "info") bgColor = "#1976d2";

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 9999,
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        background: bgColor,
        color: "white",
        padding: "14px 32px",
        borderRadius: 8,
        minWidth: 240,
        maxWidth: "80vw",
        boxShadow: "0 2px 12px rgba(0,0,0,0.36)",
        fontSize: 16,
        display: "flex",
        alignItems: "center",
        gap: 12,
        animation: "slide-up 0.2s ease"
      }}
      role="alert"
      aria-live="assertive"
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "transparent",
          color: "white",
          border: "none",
          marginLeft: 16,
          fontSize: 18,
          cursor: "pointer"
        }}
        aria-label="Close notification"
      >
        ×
      </button>
      <style>
        {`
        @keyframes slide-up {
          from { opacity:0; transform: translateX(-50%) translateY(30px);}
          to { opacity:1; transform: translateX(-50%) translateY(0);}
        }
        `}
      </style>
    </div>
  );
}
