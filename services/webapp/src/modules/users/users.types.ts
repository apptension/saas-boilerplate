export interface User {
  id: string;
  login: string;
  name: string;
  displayName: string;
  email: string;
}

export interface UsersState {
  users: User[];
}
