import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import './SystemAdminDashboard.css';

export default function SystemAdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProfessionals: 0
  });

  const [usersList, setUsersList] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Verify admin role
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
          setUser(currentUser);
          await fetchDashboardData();
        } else {
          // Not an admin, boot them to home
          navigate('/');
        }
      } else {
        navigate('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      // In a real production app, we would use aggregations or pagination.
      // For this demo, we'll fetch all users.
      const usersQuery = await getDocs(collection(db, 'users'));
      let usersCount = 0;
      let profsCount = 0;
      const allUsers = [];

      usersQuery.forEach((docSnap) => {
        const data = docSnap.data();
        allUsers.push({ id: docSnap.id, ...data });
        
        if (data.role === 'professional') {
          profsCount++;
        } else if (data.role === 'user') {
          usersCount++;
        }
      });

      setStats({
        totalUsers: usersCount,
        totalProfessionals: profsCount
      });
      setUsersList(allUsers);
    } catch (error) {
      console.error("Error fetching admin data: ", error);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading System Admin Dashboard...</div>;
  }

  return (
    <div className="sysadmin-dashboard-layout">
      {/* Sidebar */}
      <div className="sysadmin-sidebar">
        <div className="sysadmin-sidebar-header">
          <h2>System Admin</h2>
          <p>Manage the platform, users, and professionals.</p>
        </div>
        
        <div className="sysadmin-sidebar-stats">
          <div className="stat-card">
            <h3>Total Customers</h3>
            <span className="stat-value">{stats.totalUsers}</span>
          </div>
          <div className="stat-card">
            <h3>Total Professionals</h3>
            <span className="stat-value">{stats.totalProfessionals}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="sysadmin-main-content">
        <div className="sysadmin-card">
          <div className="sysadmin-card-header">
            <h1>Platform Users</h1>
            <p>View and manage all registered accounts on the platform.</p>
          </div>

          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {usersList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">No users found.</td>
                  </tr>
                ) : (
                  usersList.map((usr) => (
                    <tr key={usr.id}>
                      <td>{usr.name || `${usr.firstName || ''} ${usr.lastName || ''}`.trim() || 'Unknown'}</td>
                      <td>{usr.email}</td>
                      <td>
                        <span className={`role-badge role-${usr.role}`}>
                          {usr.role || 'user'}
                        </span>
                      </td>
                      <td>{usr.createdAt ? new Date(usr.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <button className="btn-table-action">View</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
