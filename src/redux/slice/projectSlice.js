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


export const getstageDetails = createAsyncThunk(
    "user/getstageDetails",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await api.getStageDetails(formData);
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
        getstageDetailsData:null,
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


    //          .addCase(getstageDetails.pending, (state) => {
    //             state.loading = true;
    //             state.error = null;
    //         })
    //         .addCase(getstageDetails.fulfilled, (state, action) => {
    //             const getstageAllDetailsData= action?.payload?.data || [];
    //             state.getstageDetailsData= getstageAllDetailsData;
    //             state.loading = false;
    //         })
    //         .addCase(getstageDetails.rejected, (state, action) => {
    //             state.loading = false;
    //             state.error = action.payload || action.error.message;
    //             state.getstageDetailsData = null;
    //             toast.error(action?.payload?.message)
    //         })
    // }


     .addCase(getstageDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // ✅ SUCCESS (FIXED HERE)
      .addCase(getstageDetails.fulfilled, (state, action) => {
        const data = action?.payload?.data || {};

        // 🔥 get spool_id from dispatched args
        const spoolId = action.meta.arg.spool_id;

        // ✅ store per spool (IMPORTANT FIX)
        state.getstageDetailsData = {
          ...state.getstageDetailsData,
          [spoolId]: data,
        };

        state.loading = false;
      })

      // ❌ ERROR
      .addCase(getstageDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;

        toast.error(action?.payload?.message || "Failed to fetch stage details");
      });
  },
})

export default projectSlice.reducer;