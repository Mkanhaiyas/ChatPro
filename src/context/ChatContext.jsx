import { createContext, useContext, useReducer } from "react";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);

  const INITIAL_STATE = {
    chatId: null,
    user: {},
  };

  const chatReducer = (state, action) => {
    switch (action.type) {
      case "CHANGE_USER":
        if (!currentUser || !action.payload) return state;

        const combinedId =
          currentUser.uid > action.payload.uid
            ? currentUser.uid + "_" + action.payload.uid
            : action.payload.uid + "_" + currentUser.uid;

        return {
          user: action.payload,
          chatId: combinedId,
        };

      case "RESET_CHAT":
        return {
          user: {},
          chatId: null,
        };

      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

  return (
    <ChatContext.Provider value={{ data: state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};
