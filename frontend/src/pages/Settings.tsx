import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import Spinner from '../components/Spinner';
import { exportFullReport } from '../utils/exportReport';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

function Settings() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === UserRole.Admin;
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');

  const handleExport = async () => {
    setError('');
    setIsExporting(true);
    try {
      await exportFullReport();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to export report. Please try again.'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>

        {isAdmin && (
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Export Full Report</h3>
            <p className="text-sm text-gray-500 mb-4">
              Download a spreadsheet of all employees, managers, and projects.
            </p>
            {error && (
              <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2.5 shadow-sm hover:bg-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isExporting && <Spinner size={16} />}
              {isExporting ? 'Exporting...' : 'Export to Excel'}
            </button>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Settings;
