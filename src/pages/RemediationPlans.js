import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Calendar, User, AlertCircle } from 'lucide-react';
import useCSFStore from '../stores/csfStore';
import useUIStore from '../stores/uiStore';
import useUserStore from '../stores/userStore';
import useSort from '../hooks/useSort';
import SortableHeader from '../components/SortableHeader';

const RemediationPlans = () => {
  const data = useCSFStore((state) => state.data);
  const users = useUserStore((state) => state.users);
  const navigate = useNavigate();

  // Filter items that have remediation data
  const remediationItems = useMemo(() => {
    return data.filter(item =>
      item.remediationOwnerId ||
      item['Action Plan'] ||
      item['Remediation Due Date']
    );
  }, [data]);

  // Sorting
  const { sort, sortedData, handleSort } = useSort(remediationItems);

  // Get user name by ID
  const getUserName = (userId) => {
    if (!userId) return 'Not assigned';
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  };

  // Check if due date is past
  const isPastDue = (dateStr) => {
    if (!dateStr) return false;
    const dueDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  // Check if due date is within 7 days
  const isDueSoon = (dateStr) => {
    if (!dateStr) return false;
    const dueDate = new Date(dateStr);
    const today = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(today.getDate() + 7);
    today.setHours(0, 0, 0, 0);
    return dueDate >= today && dueDate <= weekFromNow;
  };

  const handleRowClick = (item) => {
    // Navigate to Requirements page and select this item
    useUIStore.getState().setCurrentItemId(item.ID);
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 p-4 border-b">
        <div className="flex items-center gap-3">
          <ClipboardList size={24} className="text-blue-600" />
          <div>
            <h1 className="text-xl font-bold">Remediation Plans</h1>
            <p className="text-sm text-gray-600">
              {remediationItems.length} item{remediationItems.length !== 1 ? 's' : ''} with remediation plans
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {remediationItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <ClipboardList size={48} className="mb-4 opacity-50" />
            <p className="text-lg">No remediation plans found</p>
            <p className="text-sm mt-2">Create remediation plans in the Requirements tab</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <SortableHeader label="ID" sortKey="ID" currentSort={sort} onSort={handleSort} />
                <SortableHeader label="Subcategory" sortKey="Subcategory ID" currentSort={sort} onSort={handleSort} />
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <SortableHeader label="Due Date" sortKey="Remediation Due Date" currentSort={sort} onSort={handleSort} />
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action Plan</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.map((item) => (
                <tr
                  key={item.ID}
                  className="hover:bg-blue-50:bg-gray-800 cursor-pointer"
                  onClick={() => handleRowClick(item)}
                >
                  <td className="p-3 text-sm font-medium">{item.ID}</td>
                  <td className="p-3 text-sm">
                    <div className="font-medium">{item['Subcategory ID']}</div>
                    <div className="text-xs text-gray-500 line-clamp-1">{item['Subcategory Description']}</div>
                  </td>
                  <td className="p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-400" />
                      <span className="">{getUserName(item.remediationOwnerId)}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm">
                    {item['Remediation Due Date'] ? (
                      <div className={`flex items-center gap-2 ${
                        isPastDue(item['Remediation Due Date'])
                          ? 'text-red-600'
                          : isDueSoon(item['Remediation Due Date'])
                            ? 'text-orange-600'
                            : ''
                      }`}>
                        <Calendar size={14} />
                        <span>{item['Remediation Due Date']}</span>
                        {isPastDue(item['Remediation Due Date']) && (
                          <AlertCircle size={14} className="text-red-600" />
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">No date set</span>
                    )}
                  </td>
                  <td className="p-3 text-sm">
                    <div className="line-clamp-2">
                      {item['Action Plan'] || <span className="text-gray-400">No action plan</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RemediationPlans;
