import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { logoutUser } from "../features/auth/authSlice";
import { fetchUnreadShareCount } from "../features/post/postSlice";
import { useEffect } from "react";

const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const unreadShareCount = useSelector((state) => state.post.unreadShareCount);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchUnreadShareCount());
    }
  }, [dispatch, user?._id]);

  return (
    <header className="navbar">
      <div className="brand">
        <span className="brand-dot" />
        <span>Social</span>
      </div>
      <div className="nav-actions">
        <button className="icon-button" type="button" aria-label="alerts">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 4a5 5 0 0 0-5 5v3.2l-1.4 2.6h12.8L17 12.2V9a5 5 0 0 0-5-5Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <path
              d="M10.5 18a1.5 1.5 0 0 0 3 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
          {unreadShareCount > 0 ? (
            <span className="badge count">{unreadShareCount}</span>
          ) : null}
        </button>
        {user ? (
          <button
            className="ghost-button"
            type="button"
            onClick={() => dispatch(logoutUser())}
          >
            Logout
          </button>
        ) : (
          <div className="auth-links">
            <Link className="ghost-button" to="/login">
              Login
            </Link>
            <Link className="ghost-button" to="/signup">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
