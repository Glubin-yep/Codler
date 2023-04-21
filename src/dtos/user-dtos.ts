export default class UserDTO {
    readonly email: string;
    readonly userId: string;
    readonly isActivated: boolean;
  
    constructor(model: { email: string; _id: string; isActivated: boolean }) {
      this.email = model.email;
      this.userId = model._id.toString();
      this.isActivated = model.isActivated;
    }
  }
  