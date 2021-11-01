import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { RegisterUserDto } from './dto/register-user.dto';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async createUser(registerUserDto: RegisterUserDto): Promise<void> {
    const { name, email, password } = registerUserDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.create({ name, email, password: hashedPassword });
    try {
      await this.save(user);
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('This email is already registered');
      }
      throw new InternalServerErrorException();
    }
  }
}
