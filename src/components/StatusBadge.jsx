import React from 'react';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const StatusBadge = ({ count, max, label, type = 'default' }) => {
  const isComplete = count === max;
  const isEmpty = count === 0;
  
  let bgColor, textColor, icon;
  
  if (type === 'skills') {
    if (isComplete) {
      bgColor = 'bg-green-900/50';
      textColor = 'text-green-400';
      icon = <CheckCircle size={14} />;
    } else if (isEmpty) {
      bgColor = 'bg-red-900/50';
      textColor = 'text-red-400';
      icon = <XCircle size={14} />;
    } else {
      bgColor = 'bg-yellow-900/50';
      textColor = 'text-yellow-400';
      icon = <AlertCircle size={14} />;
    }
  } else if (type === 'optional') {
    bgColor = count > 0 ? 'bg-blue-900/50' : 'bg-gray-700';
    textColor = count > 0 ? 'text-blue-400' : 'text-gray-500';
    icon = count > 0 ? <CheckCircle size={14} /> : <AlertCircle size={14} />;
  } else {
    bgColor = 'bg-gray-700';
    textColor = 'text-gray-400';
    icon = null;
  }

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded ${bgColor} ${textColor} text-xs`}>
      {icon}
      <span className="font-semibold">{count}/{max}</span>
      <span>{label}</span>
    </div>
  );
};

export default StatusBadge;