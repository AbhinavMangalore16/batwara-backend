import { IsString, IsEmail, MinLength } from 'class-validator';

export class RegisterUserDTO {
  // Define class properties with decorators
  // e.g., name, email, password
  // This ensures request body is valid before it reaches the controller
}