export interface User {
  id: string;
  userName: string;
  email: string;
  password: string;
  role: "ADMIN" | "USER" ;
  createdAt: string;
  updatedAt: string;
}