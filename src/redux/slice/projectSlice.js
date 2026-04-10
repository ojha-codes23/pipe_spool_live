import { createSlice } from "@reduxjs/toolkit";
import * as api from "../api";
import toast from "react-hot-toast";
import { createAsyncThunk } from "@reduxjs/toolkit";


export const spoolByProject = createAsyncThunk(
    "user/spoolByProject",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await api.spoolsApi(formData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const projectSlice = createSlice({
    name: "projet",
    initialState: {
        projectsData: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(spoolByProject.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(spoolByProject.fulfilled, (state, action) => {
                const projectData = action?.payload?.data || [];
                state.projectsData = projectData;
                state.loading = false;
            })
            .addCase(spoolByProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
                state.projectsData = [];
                toast.error(action?.payload?.message)
            })
    }
})

export default projectSlice.reducer;