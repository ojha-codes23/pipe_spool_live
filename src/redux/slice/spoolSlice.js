import { createSlice } from "@reduxjs/toolkit";
import * as api from "../api";
import toast from "react-hot-toast";
import { createAsyncThunk } from "@reduxjs/toolkit";


export const fetchSpools = createAsyncThunk(
    "user/fetchSpools",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await api.fetchSpoolsApi(formData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchSpoolsDrawing = createAsyncThunk(
    "user/fetchSpoolsDrawing",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await api.fetchSpoolsDrawingApi(formData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const spoolSlice = createSlice({
    name: "spool",
    initialState: {
        spoolData: [],
        spoolDrawingDetails: null,
        loading: false,
        error: null
    },
    reducers: {
        resetSpoolDrawingDetails: (state) => {
            state.spoolDrawingDetails = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSpools.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSpools.fulfilled, (state, action) => {
                const spools = action?.payload?.data || [];
                state.spoolData = spools;
                state.loading = false;
            })
            .addCase(fetchSpools.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
                state.projectsData = [];
                toast.error(action?.payload?.message)
            })
        builder
            .addCase(fetchSpoolsDrawing.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSpoolsDrawing.fulfilled, (state, action) => {
                const spoolDetails = action?.payload?.data || [];
                state.spoolDrawingDetails = spoolDetails;
                state.loading = false;
            })
            .addCase(fetchSpoolsDrawing.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
                
                state.spoolDrawingDetails = [];
                toast.error(action?.payload?.message)
            })
    }
})
export const { resetSpoolDrawingDetails } = spoolSlice.actions;
export default spoolSlice.reducer;