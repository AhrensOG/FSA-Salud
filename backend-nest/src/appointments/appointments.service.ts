import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, In, Not } from 'typeorm';
import { Appointment, AppointmentStatus, AppointmentType } from './entities/appointment.entity';
import { User } from '../users/entities/user.entity';

const BUSINESS_START = 8;
const BUSINESS_END = 18;
const SLOT_MINUTES = 30;

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function generateSlots(): string[] {
  const slots: string[] = [];
  for (let h = BUSINESS_START; h < BUSINESS_END; h++) {
    for (let m = 0; m < 60; m += SLOT_MINUTES) {
      slots.push(`${pad(h)}:${pad(m)}`);
    }
  }
  return slots;
}

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
  ) {}

  async create(
    patientId: string,
    data: { date: string; time: string; reason: string; type?: AppointmentType; doctorId?: string },
  ): Promise<Appointment> {
    const appointment = this.appointmentsRepository.create({
      patientId,
      doctorId: data.doctorId ?? null,
      date: data.date,
      time: data.time,
      reason: data.reason,
      type: data.type ?? AppointmentType.PRESENCIAL,
      status: AppointmentStatus.PENDIENTE,
    });

    return this.appointmentsRepository.save(appointment);
  }

  async getAvailability(doctorId: string, date: string): Promise<{ date: string; slots: string[] }> {
    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      throw new BadRequestException('No se puede consultar disponibilidad en fechas pasadas');
    }

    const allSlots = generateSlots();

    const taken = await this.appointmentsRepository.find({
      where: { doctorId, date, status: Not(AppointmentStatus.COMPLETADA) },
      select: { time: true },
    });

    const takenTimes = new Set(taken.map((a) => a.time));
    const available = allSlots.filter((slot) => !takenTimes.has(slot));

    return { date, slots: available };
  }

  async getMonthAvailability(
    doctorId: string,
    year: number,
    month: number,
  ): Promise<Record<string, number>> {
    const totalSlots = generateSlots().length;
    const today = new Date().toISOString().split('T')[0];

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = `${year}-${pad(month + 1)}-01`;
    const lastDay = `${year}-${pad(month + 1)}-${pad(daysInMonth)}`;

    const taken = await this.appointmentsRepository.find({
      where: { doctorId, date: MoreThanOrEqual(firstDay), status: Not(AppointmentStatus.COMPLETADA) },
      select: { date: true, time: true },
    });

    const takenByDate = new Map<string, number>();
    for (const a of taken) {
      if (a.date > lastDay) continue;
      takenByDate.set(a.date, (takenByDate.get(a.date) || 0) + 1);
    }

    const result: Record<string, number> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${year}-${pad(month + 1)}-${pad(d)}`;
      if (date < today) continue;
      const takenCount = takenByDate.get(date) || 0;
      result[date] = totalSlots - takenCount;
    }

    return result;
  }

  async findFutureByPatient(patientId: string): Promise<Appointment[]> {
    const today = new Date().toISOString().split('T')[0];

    return this.appointmentsRepository.find({
      where: {
        patientId,
        date: MoreThanOrEqual(today),
      },
      order: { date: 'ASC', time: 'ASC' },
    });
  }

  async findAllByPatient(patientId: string): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      where: { patientId },
      order: { date: 'DESC', time: 'DESC' },
    });
  }

  async findById(id: string): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({ where: { id } });
    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }
    return appointment;
  }

  async findFutureByDoctor(doctorId: string): Promise<Appointment[]> {
    const today = new Date().toISOString().split('T')[0];

    return this.appointmentsRepository.find({
      where: {
        doctorId,
        date: MoreThanOrEqual(today),
        status: Not(AppointmentStatus.COMPLETADA),
      },
      order: { date: 'ASC', time: 'ASC' },
    });
  }
}
