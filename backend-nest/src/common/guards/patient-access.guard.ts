import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../../appointments/entities/appointment.entity';

@Injectable()
export class PatientAccessGuard implements CanActivate {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const doctorId = request.user?.id;
    const patientId = request.params.patientId;

    if (!doctorId || !patientId) {
      throw new ForbiddenException('Acceso denegado');
    }

    const appointment = await this.appointmentsRepository.findOne({
      where: { doctorId, patientId: patientId },
    });

    if (!appointment) {
      throw new ForbiddenException(
        'No tenés acceso al historial de este paciente. Solo podés ver pacientes con los que tenés una cita.',
      );
    }

    return true;
  }
}
