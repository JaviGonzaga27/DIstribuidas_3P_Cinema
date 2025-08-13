// Componente de actividad reciente

import { RecentActivity } from '@/features/dashboard/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { formatDate } from '@/utils';

interface RecentActivityListProps {
  activities: RecentActivity[];
  isLoading?: boolean;
}

const getActivityIcon = (type: RecentActivity['type']) => {
  switch (type) {
    case 'booking':
      return '🎫';
    case 'review':
      return '⭐';
    case 'user_registration':
      return '👤';
    default:
      return '📝';
  }
};

const getActivityColor = (type: RecentActivity['type']) => {
  switch (type) {
    case 'booking':
      return 'text-green-600';
    case 'review':
      return 'text-yellow-600';
    case 'user_registration':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
};

export function RecentActivityList({ activities, isLoading }: RecentActivityListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No hay actividad reciente
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    {activity.description}
                  </p>
                  {activity.userName && (
                    <p className="text-xs text-gray-500">
                      por {activity.userName}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    {formatDate(activity.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
