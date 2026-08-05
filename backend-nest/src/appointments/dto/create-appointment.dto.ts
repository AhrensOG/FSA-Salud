import { IsNotEmpty, IsString, IsDateString, IsOptional, IsEnum, IsUUID, Matches } from 'class-validator';
import { AppointmentType } from '../entities/appointment.entity';

export class CreateAppointmentDto {
  @IsDateString()
  date: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Formato de hora inválido (HH:mm)' })
  time: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsEnum(AppointmentType)
  @IsOptional()
  type?: AppointmentType;

  @IsUUID()
  @IsOptional()
  doctorId?: string;
}
