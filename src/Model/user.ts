export interface User {
  id: string;
  fullName:string;
  username: string;
  dateOfBirth:Date;
  phone: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  email: string;
  password: string;
  image: string;
  address:string;
  posts:number;
  followers:number;
  following:number;
  confirmPassword: string;
  role: "ADMIN" | "USER" ;
  createdAt: string;
  updatedAt: string;
}