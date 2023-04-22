export default class UserDTO {
    readonly mobilePhone: string;
    readonly email: string;
    readonly userId: string;
    readonly isActivated: boolean;
  
    constructor(model: { mobilePhone: string; email: string; _id: string; isActivated: boolean }) {
      this.mobilePhone = model.mobilePhone;
      this.email = model.email;
      this.userId = model._id.toString();
      this.isActivated = model.isActivated;
    }
  }
  