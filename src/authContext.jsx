import React, { useReducer } from "react";
import MkdSDK from "./utils/MkdSDK";

export const AuthContext = React.createContext();

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  role: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        token: action.payload.token,
        role: action.payload.role,
      };
    case "LOGOUT":
      localStorage.clear();
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        role: null,
      };
    default:
      return state;
  }
};

let sdk = new MkdSDK();

export const tokenExpireError = (dispatch, errorMessage) => {
  const role = localStorage.getItem("role");
  if (errorMessage === "TOKEN_EXPIRED") {
    dispatch({
      type: "Logout",
    });
    window.location.href = "/" + role + "/login";
  }
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  React.useEffect(() => {
    //TODO
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    if (token && user) {
      const tokenExpirationInSeconds = user.expire_at;
      const tokenExpirationTime =
        new Date().getTime() + tokenExpirationInSeconds * 1000;
      console.log("date", new Date());
      if (tokenExpirationTime > new Date().getTime()) {
        console.log("valid");
        dispatch({
          type: "LOGIN",
          payload: {
            token: token,
            role: user.role,
            user: user,
          },
        });
      } else {
        console.log("expired");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        dispatch({ type: "LOGOUT" });
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
