import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSearch, Calendar, User, CheckCircle, XCircle } from 'lucide-react';
import useCSFStore from '../stores/csfStore';
import useUIStore from '../stores/uiStore';
import useUserStore from '../stores/userStore';
import useSort from '../hooks/useSort';
import SortableHeader from '../components/SortableHeader';

const AssessmentObservations = () => {
  const data = useCSFStore((state) => state.data);
  const users = useUserStore((state) => state.users);
  const navigate = useNavigate();
  const [selectedQuarter, setSelectedQuarter] = useState(1);

  // Helper to get quarterly observations
  const getQuarterObservations = (item, quarter) => {
    const quarters = item.quarters || {};
    const qData = quarters[`Q${quarter}`] || {};
    return qData.observations || '';
  };

  // Helper to get quarterly data
  const getQuarterData = (item, quarter) => {
    const quarters = item.quarters || {};
    return quarters[`Q${quarter}`] || {};
  };

  // Filter items that have observations for the selected quarter
  const observationItems = useMemo(() => {
    return data.filter(item => {
      const obs = getQuarterObservations(item, selectedQuarter);
      return obs && obs.trim() !== '';
    });
  }, [data, selectedQuarter]);

  // Sorting
  const { sort, sortedData, handleSort } = useSort(observationItems);

  // Get user name by ID - returns "name <email>" format for display
  const getUserName = (userId) => {
    if (!userId) return 'Not assigned';
    const user = users.find(u => u.id === userId);
    if (!user) return 'Unknown';
    return user.email ? `${user.name} <${user.email}>` : user.name;
  };

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'Complete':
      case 'Completed':
        return 'text-green-600 bg-green-100';
      case 'In Progress':
        return 'text-blue-600 bg-blue-100';
      case 'Not Started':
        return 'text-gray-500 bg-gray-100';
      case 'Submitted':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const handleRowClick = (item) => {
    // Navigate to Requirements page and select this item
    useUIStore.getState().setCurrentItemId(item.ID);
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileSearch size={24} className="text-blue-600" />
            <div>
              <h1 className="text-xl font-bold">Assessment Observations</h1>
              <p className="text-sm text-gray-600">
                {observationItems.length} item{observationItems.length !== 1 ? 's' : ''} with documented observations for Q{selectedQuarter}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Quarter:</span>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(Number(e.target.value))}
              className="p-2 border rounded-lg bg-white"
            >
              <option value={1}>Q1</option>
              <option value={2}>Q2</option>
              <option value={3}>Q3</option>
              <option value={4}>Q4</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {observationItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FileSearch size={48} className="mb-4 opacity-50" />
            <p className="text-lg">No observations documented</p>
            <p className="text-sm mt-2">Document observations in the Requirements tab</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <SortableHeader label="ID" sortKey="ID" currentSort={sort} onSort={handleSort} />
                <SortableHeader label="Subcategory" sortKey="Subcategory ID" currentSort={sort} onSort={handleSort} />
                <SortableHeader label="In Scope" sortKey="In Scope? " currentSort={sort} onSort={handleSort} />
                <SortableHeader label="Status" sortKey="Testing Status" currentSort={sort} onSort={handleSort} />
                <SortableHeader label="Date" sortKey="Observation Date" currentSort={sort} onSort={handleSort} />
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auditor</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observations</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.map((item) => {
                const qData = getQuarterData(item, selectedQuarter);
                return (
                  <tr
                    key={item.ID}
                    className="hover:bg-blue-50 cursor-pointer"
                    onClick={() => handleRowClick(item)}
                  >
                    <td className="p-3 text-sm font-medium">{item.ID}</td>
                    <td className="p-3 text-sm">
                      <div className="font-medium">{item['Subcategory ID']}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{item['Subcategory Description']}</div>
                    </td>
                    <td className="p-3 text-sm">
                      <div className={`rounded-full flex items-center justify-center w-6 h-6 ${
                        item['In Scope? '] === 'Yes' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {item['In Scope? '] === 'Yes' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(qData.testingStatus)}`}>
                        {qData.testingStatus || 'Not Started'}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      {qData.observationDate ? (
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span>{qData.observationDate}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">No date</span>
                      )}
                    </td>
                    <td className="p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        <span className="">{getUserName(item.auditorId)}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      <div className="line-clamp-2 max-w-md">
                        {qData.observations}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AssessmentObservations;
