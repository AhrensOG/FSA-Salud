import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dni: string;
    phone: string;
    address: string;
    city: string;
    role: UserRole;
    specialty?: string;
  }): Promise<User> {
    const existing = await this.usersRepository.findOne({
      where: [{ email: data.email }, { dni: data.dni }],
    });

    if (existing) {
      throw new ConflictException('El email o DNI ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.usersRepository.create({
      ...data,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async findByRole(role: UserRole, specialty?: string): Promise<Partial<User>[]> {
    const where: any = { role };
    if (specialty) {
      where.specialty = specialty;
    }

    return this.usersRepository.find({
      where,
      select: { id: true, firstName: true, lastName: true, email: true, phone: true, dni: true, specialty: true },
      order: { lastName: 'ASC' },
    });
  }

  async findByDni(dni: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { dni } });
  }
}
