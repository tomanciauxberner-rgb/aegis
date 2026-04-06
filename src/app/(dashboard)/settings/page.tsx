import { Building2, Users, Key } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold mb-1">
          Settings
        </h1>
        <p className="text-sm text-text-muted">
          Organization settings and team management
        </p>
      </div>

      <div className="space-y-6">
        {/* Organization */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded bg-accent-soft flex items-center justify-center">
              <Building2 className="w-4 h-4 text-accent" />
            </div>
            <h2 className="font-semibold">Organization</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
                Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-bg border border-border rounded text-sm text-text focus:outline-none focus:border-accent transition-colors"
                placeholder="Organization name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
                Sector
              </label>
              <select className="w-full px-3 py-2 bg-bg border border-border rounded text-sm text-text focus:outline-none focus:border-accent transition-colors">
                <option value="">Select sector</option>
                <option value="employment">Employment / HR</option>
                <option value="education">Education</option>
                <option value="finance">Finance / Credit</option>
                <option value="insurance">Insurance</option>
                <option value="public">Public sector</option>
                <option value="law_enforcement">Law enforcement</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded bg-gold-soft flex items-center justify-center">
              <Users className="w-4 h-4 text-gold" />
            </div>
            <h2 className="font-semibold">Team members</h2>
          </div>
          <p className="text-sm text-text-muted">
            Invite team members to collaborate on FRIA assessments. Roles:
            Owner, Admin, Analyst, Viewer.
          </p>
        </div>

        {/* API Keys */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded bg-success-soft flex items-center justify-center">
              <Key className="w-4 h-4 text-success" />
            </div>
            <h2 className="font-semibold">API Access</h2>
          </div>
          <p className="text-sm text-text-muted">
            Generate API keys to access the Aegis Open Data API and integrate
            with your existing compliance tools.
          </p>
        </div>
      </div>
    </div>
  );
}
