import { createElement } from "react";
import { createBrowserRouter } from "react-router";
import LoginPage from "./components/login/LoginPage";
import StudentDashboard from "./components/student/StudentDashboard";
import FacultyDashboard from "./components/faculty/FacultyDashboard";
import AdminPanel from "./components/admin/AdminPanel";
import SmartboardInterface from "./components/smartboard/SmartboardInterface";

export const router = createBrowserRouter([
  {
    path: "/",
    element: createElement(LoginPage),
  },
  {
    path: "/student",
    element: createElement(StudentDashboard),
  },
  {
    path: "/faculty",
    element: createElement(FacultyDashboard),
  },
  {
    path: "/admin",
    element: createElement(AdminPanel),
  },
  {
    path: "/smartboard",
    element: createElement(SmartboardInterface),
  },
  {
    path: "*",
    element: createElement(LoginPage),
  },
]);
