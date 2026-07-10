import { MockDB } from './MockDB';
import { ChatMessage } from '../../types';

export class ChatMessageModel {
  static findAll(): ChatMessage[] {
    return MockDB.getCollection('chats');
  }

  static create(msg: ChatMessage): ChatMessage {
    return MockDB.insertOne('chats', msg);
  }
}
