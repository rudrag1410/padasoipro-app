import { Redirect } from 'expo-router';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks';

/** Entry point: sends the user to the right step of onboarding. */
export default function Index() {
  const { user } = useAuth();

  if (!user) return <Redirect href={ROUTES.LOGIN} />;
  if (!user.profileCompleted) return <Redirect href={ROUTES.PROFILE} />;
  return <Redirect href={user.hasSelectedTasks ? ROUTES.HOME : ROUTES.TASKS} />;
}
