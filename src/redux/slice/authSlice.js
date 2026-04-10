import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as api from "../api";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

function logouterror() {
  toast.error("Token Expired")
  localStorage.removeItem("dreamDrapperAminToken");
  setTimeout(() => {
    window.location.href = "/";
  }, 1000);
}

async function checkLogin() {
  const token = localStorage.getItem("dreamDrapperAminToken");
  if (!token) {
    window.location.href = "/";
  }
}

// Async thunk (API call)
export const login = createAsyncThunk(
  "user/login",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.loginApi(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);



const authSlice = createSlice({
  name: "auth",
  initialState: {
    userData: null,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {

    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action?.payload?.data;
        localStorage.setItem('user', JSON.stringify(action?.payload?.data?.user))
        const token = action?.payload?.data?.token;
        if (token) {
          Cookies.set("pipeSpool", token, {
            expires: 7,
            // secure: true,     
            sameSite: "strict"
          });
        }
        toast.success(action?.payload?.message)
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        toast.error(action?.payload?.message)
      });
  },
});


export default authSlice.reducer;