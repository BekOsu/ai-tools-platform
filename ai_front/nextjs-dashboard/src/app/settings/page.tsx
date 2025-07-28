"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import { 
  FiSettings, 
  FiKey, 
  FiCreditCard, 
  FiDownload, 
  FiTrash2, 
  FiShield,
  FiAlertTriangle,
  FiCopy,
  FiRefreshCw 
} from "react-icons/fi";

export default function SettingsPage() {
  const { user, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Mock API keys data
  const [apiKeys, setApiKeys] = useState([
    { id: "1", name: "Production Key", key: "ak_prod_****************************", created: "2024-01-15", lastUsed: "2 hours ago" },
    { id: "2", name: "Development Key", key: "ak_dev_****************************", created: "2024-01-10", lastUsed: "1 day ago" },
  ]);

  const [billing] = useState({
    plan: "Pro",
    credits: 156.50,
    monthlyLimit: 1000,
    usedThisMonth: 245,
    nextBilling: "2024-02-15",
    paymentMethod: "**** **** **** 4242"
  });

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading settings..." />;
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">Please log in to access settings.</p>
      </div>
    );
  }

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    const confirmation = prompt("Type 'DELETE' to confirm account deletion:");
    if (confirmation !== "DELETE") {
      alert("Account deletion cancelled.");
      return;
    }

    setIsUpdating(true);
    try {
      // TODO: Call API to delete account
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert("Account deleted successfully. You will be logged out.");
      await logout();
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert("Failed to delete account. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const generateApiKey = async (name: string) => {
    setIsUpdating(true);
    try {
      // TODO: Call API to generate new key
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newKey = {
        id: Date.now().toString(),
        name,
        key: `ak_${Date.now()}_****************************`,
        created: new Date().toISOString().split('T')[0],
        lastUsed: "Never"
      };
      setApiKeys([...apiKeys, newKey]);
      alert("API key generated successfully!");
    } catch (error) {
      console.error("Failed to generate API key:", error);
      alert("Failed to generate API key. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteApiKey = async (id: string) => {
    if (!confirm("Are you sure you want to delete this API key?")) return;
    
    setIsUpdating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setApiKeys(apiKeys.filter(key => key.id !== id));
      alert("API key deleted successfully!");
    } catch (error) {
      console.error("Failed to delete API key:", error);
      alert("Failed to delete API key. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: <FiSettings className="w-4 h-4" /> },
    { id: "api", label: "API Keys", icon: <FiKey className="w-4 h-4" /> },
    { id: "billing", label: "Billing", icon: <FiCreditCard className="w-4 h-4" /> },
    { id: "security", label: "Security", icon: <FiShield className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences.</p>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* General Tab */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Full Name</p>
                    <p className="text-gray-900">{user.name}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Account Type</p>
                    <p className="text-gray-900">{user.role || "Standard"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Member Since</p>
                    <p className="text-gray-900">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Data Export</h3>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Download Your Data</h4>
                      <p className="text-sm text-gray-600">Export all your data including AI tool usage, preferences, and account information.</p>
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                      <FiDownload className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Keys Tab */}
          {activeTab === "api" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">API Keys</h3>
                  <p className="text-sm text-gray-600">Manage your API keys for accessing AI tools programmatically.</p>
                </div>
                <button
                  onClick={() => {
                    const name = prompt("Enter a name for the new API key:");
                    if (name) generateApiKey(name);
                  }}
                  disabled={isUpdating}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                >
                  <FiKey className="w-4 h-4" />
                  <span>Generate New Key</span>
                </button>
              </div>

              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{apiKey.name}</h4>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigator.clipboard.writeText(apiKey.key)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="Copy to clipboard"
                        >
                          <FiCopy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteApiKey(apiKey.id)}
                          className="p-2 text-red-400 hover:text-red-600"
                          title="Delete API key"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">{apiKey.key}</p>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Created: {apiKey.created}</span>
                      <span>Last used: {apiKey.lastUsed}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <FiShield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Keep Your API Keys Secure</h4>
                    <p className="text-sm text-blue-700">
                      Never share your API keys publicly or commit them to version control. 
                      Store them securely and rotate them regularly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Current Plan</h3>
                <div className="p-6 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{billing.plan} Plan</h4>
                      <p className="text-gray-600">Next billing date: {billing.nextBilling}</p>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                      Change Plan
                    </button>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">${billing.credits}</p>
                      <p className="text-sm text-gray-600">Credits Remaining</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{billing.usedThisMonth}</p>
                      <p className="text-sm text-gray-600">Used This Month</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{billing.monthlyLimit}</p>
                      <p className="text-sm text-gray-600">Monthly Limit</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <FiCreditCard className="w-6 h-6 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Card ending in 4242</p>
                        <p className="text-sm text-gray-600">Expires 12/26</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                      Update
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Usage History</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">January 2024</span>
                    <span className="font-medium">$24.50</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">December 2023</span>
                    <span className="font-medium">$18.75</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">November 2023</span>
                    <span className="font-medium">$32.10</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                    <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                      Enable 2FA
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Login Sessions</h4>
                      <p className="text-sm text-gray-600">Manage active sessions across devices</p>
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                      <FiRefreshCw className="w-4 h-4" />
                      <span>View Sessions</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <FiAlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-red-900 mb-2">Danger Zone</h4>
                      <p className="text-sm text-red-700 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isUpdating}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        <span>{isUpdating ? "Deleting..." : "Delete Account"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}