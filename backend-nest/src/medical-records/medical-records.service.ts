import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecord, RecordStatus } from './entities/medical-record.entity';
import { Study, StudyStatus } from './entities/study.entity';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectRepository(MedicalRecord)
    private readonly recordsRepository: Repository<MedicalRecord>,
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
    @InjectRepository(Study)
    private readonly studiesRepository: Repository<Study>,
  ) {}

  async create(
    doctorId: string,
    appointmentId: string,
    data: {
      diagnosis: string;
      treatment?: string;
      observations?: string;
      medications?: string;
      studyItems?: { name: string; results?: string }[];
    },
  ): Promise<MedicalRecord> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    if (appointment.doctorId !== doctorId) {
      throw new ForbiddenException('No podés registrar esta consulta');
    }

    const existing = await this.recordsRepository.findOne({
      where: { appointmentId },
    });

    if (existing) {
      throw new ForbiddenException('Esta cita ya tiene un registro médico');
    }

    const hasPendingStudies = data.studyItems?.some((s) => !s.results);

    const record = this.recordsRepository.create({
      patientId: appointment.patientId,
      doctorId,
      appointmentId,
      diagnosis: data.diagnosis,
      treatment: data.treatment,
      observations: data.observations,
      medications: data.medications,
      status: hasPendingStudies ? RecordStatus.PENDIENTE_RESULTADOS : RecordStatus.COMPLETADO,
    });

    const saved = await this.recordsRepository.save(record);

    if (data.studyItems?.length) {
      const studyEntities = data.studyItems.map((item) =>
        this.studiesRepository.create({
          medicalRecordId: saved.id,
          name: item.name,
          results: item.results || undefined,
          status: item.results ? StudyStatus.COMPLETADO : StudyStatus.PENDIENTE,
        } as Partial<Study>),
      );
      await this.studiesRepository.save(studyEntities);
    }

    await this.appointmentsRepository.update(appointmentId, {
      status: AppointmentStatus.COMPLETADA,
    });

    return saved;
  }

  async findByPatient(patientId: string, doctorId: string): Promise<MedicalRecord[]> {
    return this.recordsRepository.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, doctorId: string): Promise<MedicalRecord> {
    const record = await this.recordsRepository.findOne({ where: { id } });

    if (!record) {
      throw new NotFoundException('Registro no encontrado');
    }

    return record;
  }

  async updateStudyResults(studyId: string, doctorId: string, results: string): Promise<Study> {
    const study = await this.studiesRepository.findOne({
      where: { id: studyId },
      relations: { medicalRecord: true },
    });

    if (!study) {
      throw new NotFoundException('Estudio no encontrado');
    }

    if (study.medicalRecord.doctorId !== doctorId) {
      throw new ForbiddenException('No podés modificar este estudio');
    }

    await this.studiesRepository.update(studyId, {
      results,
      status: StudyStatus.COMPLETADO,
    });

    return this.studiesRepository.findOne({ where: { id: studyId } }) as Promise<Study>;
  }
}
