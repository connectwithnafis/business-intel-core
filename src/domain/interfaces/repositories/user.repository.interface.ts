import { User } from "../../entities/user";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(userId: string, updates: Partial<User>): Promise<void>;
}