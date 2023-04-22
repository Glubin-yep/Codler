import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  mobilePhone: string;
  email: string;
  password: string;
  isActivated: boolean;
  activationLink: string;
}

const UserSchema: Schema = new Schema({
  mobilePhone: { type: String, unique: true, required: true },
  email: { type: String, unique: false, required: true },
  password: { type: String, required: true },
  isActivated: { type: Boolean, default: false },
  activationLink: { type: String },
});

export default model<IUser>('User', UserSchema);
