import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slice/authSlice";
import entityReducer from "./slice/entitySlice";
import projectReducer from "./slice/projectSlice";
import spoolReducer from "./slice/spoolSlice";
import taskReducer from "./slice/taskSlice";

export const store = configureStore({
  reducer: {
    authuser: authSlice,
    entity: entityReducer,
    project: projectReducer,
    spools: spoolReducer,
    task: taskReducer
  },
});