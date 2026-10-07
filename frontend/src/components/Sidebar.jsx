import { NavLink, useNavigate } from "react-router-dom";

import {
  FiBarChart2,
  FiBell,
  FiBookOpen,
  FiCalendar,
  FiClipboard,
  FiDollarSign,
  FiFileText,
  FiGrid,
  FiLogOut,
  FiSettings,
  FiUser,
  FiUserCheck,
  FiUsers,
  FiX,
} from "react-icons/fi";

import { useAuth } from "../context/AuthContext";

const Sidebar = ({ isOpen = false, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();

    navigate("/login", {
      replace: true,
    });
  };

  const handleNavigation = () => {
    if (onClose) {
      onClose();
    }
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: <FiGrid />,
    },
    {
      label: "Students",
      path: "/students",
      icon: <FiUsers />,
    },
    {
      label: "Teachers",
      path: "/teachers",
      icon: <FiUserCheck />,
    },
    {
      label: "Classes & Sections",
      path: "/classes",
      icon: <FiBookOpen />,
    },
    {
      label: "Subjects",
      path: "/subjects",
      icon: <FiClipboard />,
    },
    {
      label: "Timetable",
      path: "/timetable",
      icon: <FiCalendar />,
    },
    {
      label: "Attendance",
      path: "/attendance",
      icon: <FiUserCheck />,
    },
    {
      label: "Fees",
      path: "/fees",
      icon: <FiDollarSign />,
    },
    {
      label: "Exams",
      path: "/exams",
      icon: <FiFileText />,
    },
    {
      label: "Results",
      path: "/results",
      icon: <FiBarChart2 />,
    },
    {
      label: "Notices",
      path: "/notices",
      icon: <FiBell />,
    },
    {
      label: "Notifications",
      path: "/notifications",
      icon: <FiBell />,
    },
    {
      label: "Academic Sessions",
      path: "/academic-sessions",
      icon: <FiCalendar />,
    },
    {
      label: "Reports",
      path: "/reports",
      icon: <FiBarChart2 />,
    },
    {
      label: "Admin Profile",
      path: "/profile",
      icon: <FiUser />,
    },
    {
      label: "Settings",
      path: "/settings",
      icon: <FiSettings />,
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside
        className={`dashboard-sidebar ${
          isOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            FS
          </div>

          <div className="sidebar-brand-text">
            <strong>Future Skill</strong>
            <span>Management</span>
          </div>

          <button
            type="button"
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <FiX />
          </button>
        </div>

        <div className="sidebar-section-label">
          MAIN MENU
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavigation}
              className={({ isActive }) =>
                isActive
                  ? "sidebar-nav-item active"
                  : "sidebar-nav-item"
              }
            >
              <span className="sidebar-nav-icon">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <span className="sidebar-nav-icon">
              <FiLogOut />
            </span>

            <span>Logout</span>
          </button>

          <div className="sidebar-version">
            Future Skill v1.0
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;