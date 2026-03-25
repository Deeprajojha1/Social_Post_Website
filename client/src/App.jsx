import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Feed from "./pages/Feed";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { fetchCurrentUser } from "./features/auth/authSlice";
import { clearAppNavigator, setAppNavigator } from "./services/navigation";

const PublicRoute = ({ user, authChecked, children }) => {
  if (!authChecked) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
};

const App = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    setAppNavigator(navigate);
    return () => clearAppNavigator();
  }, [navigate]);

  useEffect(() => {
    dispatch(fetchCurrentUser()).finally(() => setAuthChecked(true));
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<Feed />} />
      <Route
        path="/login"
        element={
          <PublicRoute user={user} authChecked={authChecked}>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute user={user} authChecked={authChecked}>
            <Signup />
          </PublicRoute>
        }
      />
    </Routes>
  );
};

export default App;
