import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UserRole } from './entities/user.entity';

const SPECIALTIES = [
  'Medicina General',
  'Traumatología',
  'Oftalmología',
  'Dermatología',
  'Pediatría',
  'Ginecología',
  'Cardiología',
  'Neurología',
  'Psiquiatría',
  'Otorrinolaringología',
  'Endocrinología',
  'Gastroenterología',
  'Neumonología',
  'Urología',
  'Nutrición',
];

@Controller()
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('doctors')
  findAll(@Query('specialty') specialty?: string) {
    return this.usersService.findByRole(UserRole.DOCTOR, specialty);
  }

  @Get('specialties')
  listSpecialties() {
    return SPECIALTIES;
  }
}
