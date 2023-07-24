import React, { useReducer, useEffect } from "react";
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
      const { token, role, user } = action.payload;

      localStorage.setItem("authState", JSON.stringify({ token, role, user }));

      return {
        ...state,
        isAuthenticated: true,
        user,
        token,
        role,
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

  const checkTokenValidity = async () => {
    try {
      const response = await Axios.post(
        "https://reacttask.mkdlabs.com/v2/api/lambda/check",
        {
          role: "admin",
        },
        {
          headers: {
            Authorization: state.token ? `Bearer ${state.token}` : "",
          },
        }
      );

      if (response.status === 200) {
        dispatch({
          type: "LOGIN",
          payload: {
            token: state.token,
            role: state.role,
            user: state.user,
          },
        });
      }
    } catch (error) {
      tokenExpireError(dispatch, error.message);
    }
  };

  useEffect(() => {
    const storedState = localStorage.getItem("authState");
    if (storedState) {
      dispatch({
        type: "LOGIN",
        payload: JSON.parse(storedState),
      });
    }
    checkTokenValidity();
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
