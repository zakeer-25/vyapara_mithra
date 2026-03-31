import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { validateOwnerToken, getWebsiteStats, VisitData } from '../services/analytics';

const WebsiteStats: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [stats, setStats] = useState<{
    totalVisits: number;
    avgDuration: number;
    visits: VisitData[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setAuthorized(false);
      setLoading(false);
      return;
    }
    

    const checkAuth = async () => {
      try {
        const isValid = await validateOwnerToken(id, token || '');
        setAuthorized(isValid);
        if (isValid) {
          const data = await getWebsiteStats(id);
          setStats(data);
        }
      } catch (err) {
        console.error('Auth failed', err);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [id, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-lg font-medium text-slate-600">Loading stats...</div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-lg font-medium text-slate-600">🔒 Unauthorized – you don’t have permission to view these stats.</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-lg font-medium text-slate-600">No stats available.</div>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-slate-800 mb-2">Website Analytics</h1>
        <p className="text-slate-500 mb-8">Track visits and engagement for your business site.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="text-4xl font-black text-emerald-600">{stats.totalVisits}</div>
            <div className="text-slate-500 mt-1">Total Visits</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="text-4xl font-black text-emerald-600">
              {formatDuration(stats.avgDuration)}
            </div>
            <div className="text-slate-500 mt-1">Average Time on Site</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800">Recent Visits</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Date & Time</th>
                  <th className="px-6 py-3">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.visits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {visit.startTime.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {visit.duration ? formatDuration(visit.duration) : "In progress"}
                    </td>
                  </tr>
                ))}
                {stats.visits.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-slate-500">
                      No visits recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteStats;