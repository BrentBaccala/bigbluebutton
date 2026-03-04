export function isUrlValid(url: string): boolean {
  return typeof url === 'string' && url.startsWith('wss:');
}

interface CurrentUser {
  presenter: boolean;
  isModerator: boolean;
  userId: string;
}

export function canOperate(operators: string, user: CurrentUser): boolean {
  if (operators === 'all') return true;
  if (operators === 'moderators') return user.isModerator;
  if (operators === 'presenter') return user.presenter;
  return user.userId === operators;
}
