import DashboardLayout from '../components/DashboardLayout';
import { exportFullReport } from '../utils/exportReport';

// No AuthContext/real auth yet, so the admin-only export section is gated
// behind this hardcoded flag. Swap for a real role check once auth exists.
const isAdmin = true;

function Settings() {
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
            <button
              type="button"
              onClick={exportFullReport}
              className="bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2.5 shadow-sm hover:bg-indigo-500 transition-colors"
            >
              Export to Excel
            </button>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Settings;
