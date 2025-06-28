import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useNotification } from '../hooks/useNotification';

const Notification: React.FC = () => {
  const { notification, hideNotification } = useNotification();

  if (!notification) return null;

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  const Icon = icons[notification.type];

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className={`p-4 rounded-lg border shadow-lg ${colors[notification.type]} animate-in slide-in-from-right duration-300`}>
        <div className="flex items-start">
          <Icon className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${iconColors[notification.type]}`} />
          <div className="flex-1">
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
          <button
            onClick={hideNotification}
            className="ml-3 flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;