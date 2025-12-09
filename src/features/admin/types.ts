export type NavigationItem =
  | 'dashboard'
  | 'users'
  | 'appointments'
  | 'revenue'
  | 'payments'
  | 'reports'
  | 'settings'

export interface User {
  id: string
  name: string
  avatar: string
  email: string
  role: string
}
