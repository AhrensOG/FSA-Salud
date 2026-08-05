import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { User } from './users/entities/user.entity';
import { Appointment } from './appointments/entities/appointment.entity';
import { Prescription } from './prescriptions/entities/prescription.entity';
import { PrescriptionItem } from './prescriptions/entities/prescription-item.entity';
import { MedicalRecord } from './medical-records/entities/medical-record.entity';
import { Study } from './medical-records/entities/study.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get('DATABASE_URL');

        if (url) {
          return {
            type: 'postgres',
            url,
            entities: [User, Appointment, Prescription, PrescriptionItem, MedicalRecord, Study],
            synchronize: true,
          };
        }

        return {
          type: 'postgres',
          host: config.get('DB_HOST', 'localhost'),
          port: config.get('DB_PORT', 5432),
          username: config.get('DB_USER', 'postgres'),
          password: config.get('DB_PASS', 'postgres'),
          database: config.get('DB_NAME', 'fsa_salud'),
          entities: [User, Appointment, Prescription, PrescriptionItem, MedicalRecord, Study],
          synchronize: true,
        };
      },
    }),
    UsersModule,
    AuthModule,
    AppointmentsModule,
    PrescriptionsModule,
    MedicalRecordsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
