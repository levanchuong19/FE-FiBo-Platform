import { createSlice } from "@reduxjs/toolkit";
import { User } from "../../Model/user";

// redux lưu thông tin user
// default value
const initialState: null | User = null;

export const userSlice = createSlice({
  name: "user",
  initialState, //initialState: initialState
  reducers: {
    login: (_state, action) => action.payload, // user
    logout: () => initialState,
  },
});

export const { login, logout } = userSlice.actions;

export default userSlice.reducer;
