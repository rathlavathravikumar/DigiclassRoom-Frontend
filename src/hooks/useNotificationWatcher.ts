import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { api } from '@/lib/api';

export const useNotificationWatcher = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const lastCheckRef = useRef<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user?._id) return;

    const checkForNewContent = async () => {
      try {
        const now = new Date();
        const lastCheck = lastCheckRef.current;

        if (user.role === 'student') {
          // Check for new assignments - get all assignments and filter client-side
          const assignmentsRes = await api.getAssignments({});
          const assignments = (assignmentsRes as any)?.data || [];
          
          const newAssignments = assignments.filter((assignment: any) => {
            const createdAt = new Date(assignment.created_at || assignment.createdAt);
            return createdAt > lastCheck;
          });

          newAssignments.forEach((assignment: any) => {
            addNotification({
              type: 'assignment',
              title: 'New Assignment Available',
              message: `"${assignment.title}" has been assigned to you`,
              relatedId: assignment._id || assignment.id,
              relatedName: assignment.title
            });
          });

          // Check for new tests
          const testsRes = await api.getTests();
          const allTests = (testsRes as any)?.data || [];
          
          // Filter tests for student's courses (you might need to adjust this based on your data structure)
          const newTests = allTests.filter((test: any) => {
            const createdAt = new Date(test.created_at || test.createdAt);
            return createdAt > lastCheck;
          });

          newTests.forEach((test: any) => {
            addNotification({
              type: 'test',
              title: 'New Test Scheduled',
              message: `"${test.title}" has been scheduled`,
              relatedId: test._id || test.id,
              relatedName: test.title
            });
          });
        }

        lastCheckRef.current = now;
      } catch (error) {
        console.error('Error checking for new content:', error);
      }
    };

    // Initial check after 5 seconds
    const initialTimeout = setTimeout(checkForNewContent, 5000);

    // Then check every 2 minutes
    intervalRef.current = setInterval(checkForNewContent, 2 * 60 * 1000);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user?._id, user?.role, addNotification]);
};
