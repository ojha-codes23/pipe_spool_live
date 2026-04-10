// store/entitySlice.js
import { createSlice } from "@reduxjs/toolkit";
import * as api from "../api";
import { toast } from "react-hot-toast";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const getAllEntity = createAsyncThunk(
  "user/getAllEntity",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.getAllEntity(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const selectEntity = createAsyncThunk(
  "user/selectEntity",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.selectEntity(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getNotification = createAsyncThunk(
  "user/getNotification",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.getNotification(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const readNotification = createAsyncThunk(
  "user/readNotification",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.readNotification(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
const getInitialSelectedEntity = () => {
  try {
    const item = localStorage.getItem("selectedEntity");
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

const initialState = {
  list: [],
  selected: null,
  project: [],
  notifications: [],
  theme: null,
  primaryColor: null,
  selectedLogo: null,
  loading: false,
  error: null
};

const entitySlice = createSlice({
  name: "entity",
  initialState,
  reducers: {
    setEntity: (state, action) => {
      state.selected = action.payload;
      state.selectedLogo = action.payload?.logo
      localStorage.setItem("selectedEntity", JSON.stringify(action.payload));
    },
    resetEntityState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllEntity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllEntity.fulfilled, (state, action) => {
        const entities = action?.payload?.data || [];
        state.list = entities;
        state.loading = false;
        const savedEntity = JSON.parse(localStorage.getItem("selectedEntity"));
        if (savedEntity) {
          const validEntity = entities.find(e => e.id === savedEntity.id);
          state.selected = validEntity || entities[0] || null;
          state.selectedLogo = entities[0]?.logo;
        } else {
          state.selectedLogo = entities[0]?.logo || null;
          state.selected = entities[0] || null;
        }
        if (state.selected) {
          localStorage.setItem("selectedEntity", JSON.stringify(state.selected));
          localStorage.setItem("logo", JSON.stringify(entities[0]?.logo));
        }
      })

      .addCase(getAllEntity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        // toast.error(action?.payload?.message)
      })
      .addCase(selectEntity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(selectEntity.fulfilled, (state, action) => {
        const projects = action.payload.data || [];
        state.project = projects;
        const primary = projects?.[0]?.entity?.entity_primary_color;
        const secondary = projects?.[0]?.entity?.entity_secondary_color;
        state.primaryColor = secondary;
        state.theme = secondary
          ? `linear-gradient(135deg, ${secondary}, #fff)`
          : "";
        if (projects?.[0]?.entity) {
          state.selected = projects[0].entity;
          // state.selectedLogo = projects?.[0]?.entity?.logo;
          localStorage.setItem("selectedEntity", JSON.stringify(projects[0].entity));
        }
        state.loading = false;
      })
      .addCase(selectEntity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

    builder
      .addCase(getNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNotification.fulfilled, (state, action) => {
        state.notifications = action?.payload?.data || [];
        state.loading = false;
      })
      .addCase(getNotification.rejected, (state, action) => {
        state.loading = false; // ✅ FIX
        state.error = action.payload || action.error.message;
        toast.error(action?.payload?.message || "Failed to fetch notifications");
      })
    builder
      .addCase(readNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(readNotification.fulfilled, (state, action) => {
        // state.notifications = action?.payload?.data || [];
        state.loading = false;
      })
      .addCase(readNotification.rejected, (state, action) => {
        state.loading = false; // ✅ FIX
        state.error = action.payload || action.error.message;
        toast.error(action?.payload?.message || "Failed to fetch notifications");
      })
  }
});

export const { setEntity, resetEntityState } = entitySlice.actions;
export default entitySlice.reducer;
