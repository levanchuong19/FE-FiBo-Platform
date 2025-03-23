export interface User {
  id: string;
  fullName:string;
  username: string;
  phone: string;
  email: string;
  password: string;
  image: string;
  confirmPassword: string;
  role: "ADMIN" | "USER" ;
  createdAt: string;
  updatedAt: string;
}