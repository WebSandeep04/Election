import React from "react";
import "./css/Dashboard.css";

const Dashboard = () => {
  // Dummy data for charts
  const userStats = {
    total: 1247,
    active: 1189,
    inactive: 58,
    newThisMonth: 45
  };

  const employeeStats = {
    total: 892,
    active: 856,
    onLeave: 23,
    terminated: 13
  };

  const electionData = {
    totalVoters: 15420,
    registeredVoters: 14230,
    turnout: 78.5,
    pollingStations: 156
  };

  const casteDistribution = [
    { name: "General", percentage: 45, color: "#3B82F6" },
    { name: "OBC", percentage: 32, color: "#10B981" },
    { name: "SC", percentage: 18, color: "#F59E0B" },
    { name: "ST", percentage: 5, color: "#EF4444" }
  ];

  const monthlyActivity = [
    { month: "Jan", users: 120, employees: 85, forms: 45 },
    { month: "Feb", users: 135, employees: 92, forms: 52 },
    { month: "Mar", users: 142, employees: 98, forms: 48 },
    { month: "Apr", users: 158, employees: 105, forms: 61 },
    { month: "May", users: 165, employees: 112, forms: 58 },
    { month: "Jun", users: 178, employees: 118, forms: 67 }
  ];

  const recentActivities = [
    { type: "user", action: "New user registered", time: "2 minutes ago", user: "John Doe" },
    { type: "employee", action: "Employee status updated", time: "15 minutes ago", user: "Jane Smith" },
    { type: "form", action: "New form submitted", time: "1 hour ago", user: "Mike Johnson" },
    { type: "village", action: "Village data updated", time: "2 hours ago", user: "Sarah Wilson" },
    { type: "caste", action: "Caste ratio modified", time: "3 hours ago", user: "David Brown" }
  ];

  const quickStats = [
    { title: "Total Villages", value: "1,247", change: "+12", changeType: "positive" },
    { title: "Active Panchayats", value: "892", change: "+8", changeType: "positive" },
    { title: "Total Booths", value: "2,156", change: "+23", changeType: "positive" },
    { title: "Forms Submitted", value: "8,945", change: "+156", changeType: "positive" }
  ];

  return (
    <div className="component-container">
      <div className="component-header">
        <h1>Dashboard</h1>
        <p>Overview of your election management system</p>
      </div>
      
      <div className="component-content">
        {/* Quick Stats Cards */}
        <div className="stats-grid">
          {quickStats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-content">
                <h3>{stat.title}</h3>
                <div className="stat-value">{stat.value}</div>
                <div className={`stat-change ${stat.changeType}`}>
                  {stat.change} from last month
                </div>
              </div>
              <div className="stat-icon">
                <div className="icon-circle"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Charts Section */}
        <div className="charts-grid">
          {/* User Statistics Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>User Statistics</h3>
              <div className="chart-actions">
                <button className="btn-secondary">Export</button>
              </div>
            </div>
            <div className="chart-content">
              <div className="metric-row">
                <div className="metric">
                  <div className="metric-value">{userStats.total}</div>
                  <div className="metric-label">Total Users</div>
                </div>
                <div className="metric">
                  <div className="metric-value">{userStats.active}</div>
                  <div className="metric-label">Active</div>
                </div>
                <div className="metric">
                  <div className="metric-value">{userStats.inactive}</div>
                  <div className="metric-label">Inactive</div>
                </div>
                <div className="metric">
                  <div className="metric-value">{userStats.newThisMonth}</div>
                  <div className="metric-label">New This Month</div>
                </div>
              </div>
              <div className="progress-chart">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(userStats.active / userStats.total) * 100}%` }}
                  ></div>
                </div>
                <div className="progress-label">
                  {((userStats.active / userStats.total) * 100).toFixed(1)}% Active Users
                </div>
              </div>
            </div>
          </div>

          {/* Employee Statistics Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Employee Overview</h3>
              <div className="chart-actions">
                <button className="btn-secondary">Details</button>
              </div>
            </div>
            <div className="chart-content">
              <div className="metric-row">
                <div className="metric">
                  <div className="metric-value">{employeeStats.total}</div>
                  <div className="metric-label">Total Employees</div>
                </div>
                <div className="metric">
                  <div className="metric-value">{employeeStats.active}</div>
                  <div className="metric-label">Active</div>
                </div>
                <div className="metric">
                  <div className="metric-value">{employeeStats.onLeave}</div>
                  <div className="metric-label">On Leave</div>
                </div>
                <div className="metric">
                  <div className="metric-value">{employeeStats.terminated}</div>
                  <div className="metric-label">Terminated</div>
                </div>
              </div>
              <div className="donut-chart">
                <div className="donut-segments">
                  <div 
                    className="donut-segment active" 
                    style={{ 
                      transform: `rotate(${(employeeStats.active / employeeStats.total) * 360}deg)`,
                      background: `conic-gradient(#10B981 0deg ${(employeeStats.active / employeeStats.total) * 360}deg, #E5E7EB ${(employeeStats.active / employeeStats.total) * 360}deg)`
                    }}
                  ></div>
                </div>
                <div className="donut-center">
                  <div className="donut-percentage">{((employeeStats.active / employeeStats.total) * 100).toFixed(1)}%</div>
                  <div className="donut-label">Active</div>
                </div>
              </div>
            </div>
          </div>

          {/* Election Data Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Election Statistics</h3>
              <div className="chart-actions">
                <button className="btn-secondary">Report</button>
              </div>
            </div>
            <div className="chart-content">
              <div className="election-stats">
                <div className="election-stat">
                  <div className="stat-number">{electionData.totalVoters.toLocaleString()}</div>
                  <div className="stat-label">Total Voters</div>
                </div>
                <div className="election-stat">
                  <div className="stat-number">{electionData.registeredVoters.toLocaleString()}</div>
                  <div className="stat-label">Registered</div>
                </div>
                <div className="election-stat">
                  <div className="stat-number">{electionData.turnout}%</div>
                  <div className="stat-label">Turnout</div>
                </div>
                <div className="election-stat">
                  <div className="stat-number">{electionData.pollingStations}</div>
                  <div className="stat-label">Polling Stations</div>
                </div>
              </div>
              <div className="turnout-chart">
                <div className="turnout-bar">
                  <div 
                    className="turnout-fill" 
                    style={{ width: `${electionData.turnout}%` }}
                  ></div>
                </div>
                <div className="turnout-label">Voter Turnout Rate</div>
              </div>
            </div>
          </div>

          {/* Caste Distribution Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Caste Distribution</h3>
              <div className="chart-actions">
                <button className="btn-secondary">Analysis</button>
              </div>
            </div>
            <div className="chart-content">
              <div className="caste-chart">
                {casteDistribution.map((caste, index) => (
                  <div key={index} className="caste-item">
                    <div className="caste-info">
                      <div className="caste-name">{caste.name}</div>
                      <div className="caste-percentage">{caste.percentage}%</div>
                    </div>
                    <div className="caste-bar">
                      <div 
                        className="caste-fill" 
                        style={{ 
                          width: `${caste.percentage}%`,
                          backgroundColor: caste.color
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Activity Chart */}
          <div className="chart-card wide">
            <div className="chart-header">
              <h3>Monthly Activity Trends</h3>
              <div className="chart-actions">
                <button className="btn-secondary">View All</button>
              </div>
            </div>
            <div className="chart-content">
              <div className="activity-chart">
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-color users"></div>
                    <span>Users</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color employees"></div>
                    <span>Employees</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color forms"></div>
                    <span>Forms</span>
                  </div>
                </div>
                <div className="chart-bars">
                  {monthlyActivity.map((month, index) => (
                    <div key={index} className="chart-bar-group">
                      <div className="bar-label">{month.month}</div>
                      <div className="bars">
                        <div 
                          className="bar users" 
                          style={{ height: `${(month.users / 200) * 100}%` }}
                          title={`${month.users} users`}
                        ></div>
                        <div 
                          className="bar employees" 
                          style={{ height: `${(month.employees / 150) * 100}%` }}
                          title={`${month.employees} employees`}
                        ></div>
                        <div 
                          className="bar forms" 
                          style={{ height: `${(month.forms / 100) * 100}%` }}
                          title={`${month.forms} forms`}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Recent Activities</h3>
              <div className="chart-actions">
                <button className="btn-secondary">View All</button>
              </div>
            </div>
            <div className="chart-content">
              <div className="activity-list">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className={`activity-icon ${activity.type}`}></div>
                    <div className="activity-content">
                      <div className="activity-text">{activity.action}</div>
                      <div className="activity-user">{activity.user}</div>
                      <div className="activity-time">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
