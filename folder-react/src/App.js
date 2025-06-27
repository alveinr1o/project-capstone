import React from "react";
import DosenDashboard from "./DosenPage";
import LoginPage from "./LoginPage";
import AdminPage from "./AdminPage";
import MahasiswaPage from "./MahasiswaPage";
import TambahBimbingan from "./TambahBimbingan";
import EditBimbingan from "./EditBimbingan";
import StudentDetailPage from "./StudentDetailPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/admin_dashboard" element={<AdminPage />} />
          <Route path="/mahasiswa_dashboard" element={<MahasiswaPage />} />
          <Route path="/dosen_dashboard" element={<DosenDashboard />} />
          <Route path="/tambah_bimbingan" element={<TambahBimbingan />} />
          <Route path="/edit-bimbingan/:id" element={<EditBimbingan />} />
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
