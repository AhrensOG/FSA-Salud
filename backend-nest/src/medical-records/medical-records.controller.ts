import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { PatientAccessGuard } from '../common/guards/patient-access.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@Controller()
@UseGuards(AuthGuard('jwt'))
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post('appointments/:appointmentId/medical-record')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR)
  create(
    @Request() req: any,
    @Param('appointmentId') appointmentId: string,
    @Body() dto: CreateMedicalRecordDto,
  ) {
    return this.medicalRecordsService.create(req.user.id, appointmentId, dto);
  }

  @Get('patients/:patientId/medical-records')
  @UseGuards(RolesGuard, PatientAccessGuard)
  @Roles(UserRole.DOCTOR)
  findByPatient(@Param('patientId') patientId: string, @Request() req: any) {
    return this.medicalRecordsService.findByPatient(patientId, req.user.id);
  }

  @Get('medical-records/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR)
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.medicalRecordsService.findOne(id, req.user.id);
  }

  @Patch('studies/:id/results')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR)
  updateStudyResults(
    @Param('id') studyId: string,
    @Body('results') results: string,
    @Request() req: any,
  ) {
    return this.medicalRecordsService.updateStudyResults(studyId, req.user.id, results);
  }
}
