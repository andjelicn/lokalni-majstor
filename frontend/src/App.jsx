import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LayoutWithHeader from "./components/LayoutWithHeader";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdPage from "./pages/AdPage";
import NewAdPage from "./pages/NewAdPage";
import ProfilePage from "./pages/ProfilePage";
import FavoritesPage from "./pages/FavoritesPage.jsx";
import MyAdsPage from "./pages/MyAdsPage.jsx";
import { EditAdPage } from "./pages/EditAdPage";
import { Toaster } from "react-hot-toast";
import './App.css'

function RequireAuth({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
      <>
    <Toaster position="top-center" reverseOrder={false} />

    <Routes>
      {/* Stranice bez headera */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Stranice sa headerom */}
      <Route element={<LayoutWithHeader />}>
        <Route
          path="/"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />
        <Route
          path="/my-ads"
          element={
            <RequireAuth>
                <MyAdsPage />
            </RequireAuth>
          }
        />

        <Route
          path="/favorites"
          element={
            <RequireAuth>
                <FavoritesPage />
            </RequireAuth>
          }
        />

        <Route
          path="/edit-ad/:id"
          element={
           <RequireAuth>
                <EditAdPage />
           </RequireAuth>
          }
          />

        <Route
          path="/pretraga"
          element={
            <RequireAuth>
              <SearchPage />
            </RequireAuth>
          }
        />
        <Route 
          path="/profil"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route path="/ads/:id" element={<AdPage />} />
        <Route
          path="/ads/new"
          element={
            <RequireAuth>
              <NewAdPage />
            </RequireAuth>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
      </>
  );
}

