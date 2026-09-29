import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/common.css";

const AlertToastContext = createContext();

export function AlertToastProvider({ children }) {
  const navigate = useNavigate();
  const [toasts, setToasts] = useState([]);
  function showAlertToast(alert) {
    const toastId = Date.now() + Math.random();
    const newToast = {
      id: toastId,
      title:
        alert.title
        ||
        "Allocation Alert",
      message:
        alert.message
        ||
        "Portfolio allocation requires attention.",
      action:
        alert.action
        ||
        "",
      amount:
        alert.amount
        ||
        0,
      portfolioId:
        alert.portfolioId
        ||
        null,
      alertId:
        alert.alertId
        ||
        null
    };

    setToasts(
      current => [
        ...current,
        newToast
      ]
    );

    setTimeout(() => {

      removeToast(
        toastId
      );

    }, 15000);

  }

  function removeToast(id) {
    setToasts(
      current =>
        current.filter(
          toast =>
            toast.id !== id
        )
    );

  }

  function viewAlert(toast) {
    removeToast(
      toast.id
    );
    navigate(
      "/alerts"
    );
  }
  return (
    <AlertToastContext.Provider
      value={{
        showAlertToast
      }}
    >
      {children}
      <div className="alert-toast-container">
        {
          toasts.map(
            toast => (
              <div
                className="alert-toast"
                key={toast.id}
              >
                <div className="alert-toast-top">
                  <div className="alert-toast-icon">
                    !
                  </div>
                  <div className="alert-toast-content">
                    <div className="alert-toast-title">
                      {toast.title}
                    </div>
                    <div className="alert-toast-message">
                      {toast.message}
                    </div>
                    {
                      toast.action
                      &&
                      (
                        <div className="alert-toast-recommendation">
                          <span
                            className={
                              toast.action
                              === "REDUCE"
                                ? "toast-reduce"
                                : toast.action
                                  === "INCREASE"
                                  ? "toast-increase"
                                  : "toast-hold"
                            }
                          >
                            {toast.action}
                          </span>
                          {
                            Number(
                              toast.amount
                            ) > 0
                            &&
                            (
                              <span>
                                ₹
                                {
                                  Number(
                                    toast.amount
                                  )
                                  .toLocaleString(
                                    "en-IN",
                                    {
                                      maximumFractionDigits: 2
                                    }
                                  )
                                }
                              </span>
                            )
                          }

                        </div>
                      )
                    }

                    <button
                      className="toast-view-button"
                      onClick={
                        () =>
                          viewAlert(
                            toast
                          )
                      }
                    >
                      View Alert →
                    </button>
                  </div>
                  <button
                    className="toast-close-button"
                    onClick={
                      () =>
                        removeToast(
                          toast.id
                        )
                    }
                  >
                    ×
                  </button>
                </div>
                <div className="alert-toast-timer">\
                  <div className="alert-toast-timer-line" />
                </div>
              </div>
            )
          )
        }
      </div>
    </AlertToastContext.Provider>
  );
}


export function useAlertToast() {
  return useContext(
    AlertToastContext
  );
}