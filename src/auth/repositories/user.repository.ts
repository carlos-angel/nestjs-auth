import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { User } from '@authModule/entities/user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async createUser(
    name: string,
    email: string,
    password: string,
    activationToken: string,
  ): Promise<void> {
    const user = this.create({ name, email, password, activationToken });
    try {
      await this.save(user);
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('This email is already registered');
      }
      throw new InternalServerErrorException();
    }
  }

  async findOneByEmail(email: string): Promise<User> {
    const user: User = await this.findOne({ email });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async activateUser(user: User): Promise<void> {
    user.active = true;
    await this.save(user);
  }

  async findOneInactiveByIdAndActivationToken(
    id: string,
    code: string,
  ): Promise<User> {
    const user: User = await this.findOne({
      id,
      activationToken: code,
      active: false,
    });

    if (!user) {
      throw new UnprocessableEntityException('This action can not be done');
    }

    return user;
  }

  async findOneByResetPasswordToken(resetPasswordToken: string): Promise<User> {
    const user: User = await this.findOne({ resetPasswordToken });
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }
}
