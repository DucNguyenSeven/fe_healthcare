export type NavigationItem =
  | 'dashboard'
  | 'users'
  | 'appointments'
  | 'revenue'
  | 'payments'

export interface User {
  id: string
  name: string
  avatar: string | null
  email: string
  role: string
}
