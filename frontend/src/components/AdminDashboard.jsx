import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, Server, Activity, ArrowLeft } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pdfsEdited: 0,
    serverLoad: 'Normal'
  });

  // Mock fetching stats
  useEffect(() => {
    // In a real app, this would be an API call to the backend
    setStats({
      totalUsers: 145,
      pdfsEdited: 892,
      serverLoad: 'Low (12% CPUs)'
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button className="btn btn-ghost" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Users */}
          <div className="glass-panel p-6 flex items-center gap-4 bg-white">
            <div className="p-4 bg-blue-100 text-blue-600 rounded-lg">
              <Users size={32} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium tracking-wide">TOTAL USERS</p>
              <h2 className="text-3xl font-bold text-slate-800">{stats.totalUsers}</h2>
            </div>
          </div>

          {/* PDFs Edited */}
          <div className="glass-panel p-6 flex items-center gap-4 bg-white">
            <div className="p-4 bg-emerald-100 text-emerald-600 rounded-lg">
              <FileText size={32} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium tracking-wide">PDFs EDITED</p>
              <h2 className="text-3xl font-bold text-slate-800">{stats.pdfsEdited}</h2>
            </div>
          </div>

          {/* Server Load */}
          <div className="glass-panel p-6 flex items-center gap-4 bg-white">
            <div className="p-4 bg-purple-100 text-purple-600 rounded-lg">
              <Server size={32} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium tracking-wide">SERVER LOAD</p>
              <h2 className="text-xl font-bold text-slate-800 mt-1">{stats.serverLoad}</h2>
            </div>
          </div>
        </div>

        {/* Recent Activity Mock */}
        <div className="glass-panel bg-white overflow-hidden rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Activity className="text-slate-400" size={20} />
            <h3 className="font-semibold text-slate-800">Recent Activity</h3>
          </div>
          <div className="p-6 text-center text-slate-500 py-12">
            Activity stream tracking is disabled in this environment. 
            <br/><span className="text-sm">Connect your database to view real-time events.</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
