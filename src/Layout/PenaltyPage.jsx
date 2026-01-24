import React from 'react';

const PenaltyPage = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Penalty Management</h1>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg">
          + Issue New Fine
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-white shadow rounded-lg border-l-4 border-red-500">
          <p className="text-sm text-gray-500">Total Outstanding</p>
          <p className="text-2xl font-bold">₹12,450</p>
        </div>
        <div className="p-4 bg-white shadow rounded-lg border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500">Pending Appeals</p>
          <p className="text-2xl font-bold">8</p>
        </div>
        <div className="p-4 bg-white shadow rounded-lg border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Collected (Monthly)</p>
          <p className="text-2xl font-bold">₹45,000</p>
        </div>
      </div>

      {/* Penalty Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-3">User/Business</th>
              <th className="px-6 py-3">Reason</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4">Rajesh Kumar</td>
              <td className="px-6 py-4">Unauthorized Ad Placement</td>
              <td className="px-6 py-4 font-semibold text-red-600">₹500</td>
              <td className="px-6 py-4">
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">Unpaid</span>
              </td>
              <td className="px-6 py-4">
                <button className="text-blue-600 hover:underline">View Details</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PenaltyPage;