import cloudinary from '../config/cloudinary';
import AppError from '../exception/appError';
import {User, UserModel} from "../model/user.model";
import {Validator} from "../utility/validator";

const UserService = {
  async get(id: number) {
    const users = await UserModel.find({ id });
    const user: User = users[0];
    if (user.id === undefined) throw new AppError("User is not undefined", 400);
    return user;
  },
  async update(body: any, file: any, user_id: number) {
    const users: Array<User> = await UserModel.find({ id: user_id });
    const user: User = users[0];
    if (user.id === undefined) {
        throw new AppError("User id is undefined", 400);
    }
    
    let imageUrl: string = '';
    
    if (file) {
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
          public_id: `${Date.now()}`,
          resource_type: "auto",
          folder: "images"
      })
      imageUrl = result?.url ?? '';
    }

    const updatedUser : User = {
        id: user.id,
        email: body.email == null ? user.email : body.email,
        password: user.password,
        name: body.name == null ? user.name : body.name,
        avatar: imageUrl == '' ? user.avatar : imageUrl
    }
    await UserModel.update(user.id, updatedUser); 
    return {
      data: "Update profile successful",
      updatedUser
    };
  },

  // page is 1-base index
  async getLeaderboard(page: any, page_size: any) {
    if (!Validator.isNumber(page, {start: 1})) page = 1;
    if (!Validator.isNumber(page_size, {start: 1})) page_size = 10;

    const result = await UserModel.getLeaderboard(page, page_size);
    return result;
  }
};

export {UserService};
