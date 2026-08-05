import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@Controller()
@UseGuards(AuthGuard('jwt'))
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post('appointments')
  create(@Request() req: any, @Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(req.user.id, dto);
  }

  @Get('appointments/mine')
  findMine(@Request() req: any) {
    return this.appointmentsService.findFutureByPatient(req.user.id);
  }

  @Get('appointments/all')
  findAll(@Request() req: any) {
    return this.appointmentsService.findAllByPatient(req.user.id);
  }

  @Get('appointments/doctor')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR)
  findDoctor(@Request() req: any) {
    return this.appointmentsService.findFutureByDoctor(req.user.id);
  }

  @Get('doctors/:doctorId/availability')
  getAvailability(
    @Param('doctorId') doctorId: string,
    @Query('date') date: string,
  ) {
    return this.appointmentsService.getAvailability(doctorId, date);
  }

  @Get('doctors/:doctorId/availability/month')
  getMonthAvailability(
    @Param('doctorId') doctorId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.appointmentsService.getMonthAvailability(
      doctorId,
      parseInt(year),
      parseInt(month) - 1,
    );
  }
}
