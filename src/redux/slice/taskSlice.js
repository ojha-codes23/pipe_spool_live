import { createSlice } from "@reduxjs/toolkit";
import * as api from "../api";
import toast from "react-hot-toast";
import { createAsyncThunk } from "@reduxjs/toolkit";


export const startAndComplateTask = createAsyncThunk(
    "user/startAndComplateTask",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await api.startComplateTaskApi(formData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);
export const pauseAndResumeTask = createAsyncThunk(
    "user/pauseAndResumeTask",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await api.pauseResumeTaskApi(formData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const reportTask = createAsyncThunk(
    "user/reportTask",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await api.reportTaskApi(formData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);


const taskSlice = createSlice({
    name: "task",
    initialState: {
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(startAndComplateTask.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(startAndComplateTask.fulfilled, (state, action) => {
                const spools = action?.payload?.data || [];
                state.spoolData = spools;
                state.loading = false;
            })
            .addCase(startAndComplateTask.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
                state.projectsData = [];
                toast.error(action?.payload?.message)
            })
        builder
            .addCase(pauseAndResumeTask.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(pauseAndResumeTask.fulfilled, (state, action) => {
                const spools = action?.payload?.data || [];
                state.spoolData = spools;
                state.loading = false;
            })
            .addCase(pauseAndResumeTask.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
                state.projectsData = [];
                toast.error(action?.payload?.message)
            })
        builder
            .addCase(reportTask.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(reportTask.fulfilled, (state, action) => {
                // const spools = action?.payload?.data || [];
                // state.spoolData = spools;
                state.loading = false;
            })
            .addCase(reportTask.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
                state.projectsData = [];
                toast.error(action?.payload?.message)
            })

    }
})

export default taskSlice.reducer;