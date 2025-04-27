import { MessageUser } from "@/lib/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ChatState {
  userSelected: MessageUser | null;
}

const initialState: ChatState = {
  userSelected: null,
}

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setUserSelected(state, action: PayloadAction<MessageUser>) {
      state.userSelected = action.payload;
    },
    clearUserSelected(state) {
      state.userSelected = null;
    },
  }
});

export const { setUserSelected, clearUserSelected } = chatSlice.actions;
export default chatSlice.reducer;