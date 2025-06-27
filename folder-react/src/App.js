import React from "react";
import DosenDashboard from "./DosenPage";
import LoginPage from "./LoginPage";
import AdminDashboard from "./Admin/AdminDashboard";
import MahasiswaPage from "./MahasiswaPage";
import StudentDetail from "./Admin/StudentDetail.jsx";
import ActivityDetail from "./Admin/ActivityDetail.jsx";
import TambahBimbingan from "./TambahBimbingan.js";
import StudentDetailPage from "./StudentDetailPage.js";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/admin_dashboard" element={<AdminDashboard />} />
          <Route path="/mahasiswa_dashboard" element={<MahasiswaPage />} />
          <Route path="/tambah_bimbingan" element={<TambahBimbingan />} />
          <Route path="/dosen_dashboard" element={<DosenDashboard />} />
          <Route path="/student-detail/:nim" element={<StudentDetail />} />
          <Route
            path="/activity-detail/:nim/:bimbinganId"
            element={<ActivityDetail />}
          />
          <Route
            path="/student-detail-page/:id"
            element={<StudentDetailPage />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
