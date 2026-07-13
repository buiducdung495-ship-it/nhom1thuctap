import { MockDB } from './MockDB';
import { User } from '../../types';

export class UserModel {
  static findById(id: string): User | undefined {
    return MockDB.findOne('users', u => u.id === id);
  }

  static findByEmail(email: string): User | undefined {
    return MockDB.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
  }

  static findByEmailOrPhoneAndId(identifier: string, employeeId: string): User | undefined {
    return MockDB.findOne('users', u => {
      const isEmailMatch = u.email && u.email.toLowerCase() === identifier.toLowerCase();
      const isPhoneMatch = u.phoneNumber && u.phoneNumber === identifier;
      const isIdMatch = u.id && u.id.toLowerCase() === employeeId.toLowerCase();
      return (isEmailMatch || isPhoneMatch) && isIdMatch;
    });
  }

  static create(user: User): User {
    return MockDB.insertOne('users', user);
  }

  static findAll(): User[] {
    return MockDB.getCollection('users');
  }

  static update(id: string, updateData: Partial<User>): boolean {
    return MockDB.updateOne('users', u => u.id === id, updateData);
  }

  static delete(id: string): boolean {
    return MockDB.deleteOne('users', u => u.id === id);
  }
}
