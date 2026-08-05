import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecord } from './entities/medical-record.entity';
import { Study } from './entities/study.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { MedicalRecordsService } from './medical-records.service';
import { MedicalRecordsController } from './medical-records.controller';
import { PatientAccessGuard } from '../common/guards/patient-access.guard';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalRecord, Appointment, Study])],
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService, PatientAccessGuard],
  exports: [MedicalRecordsService],
})
export class MedicalRecordsModule {}
