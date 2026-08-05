import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Study } from './study.entity';

export enum RecordStatus {
  COMPLETADO = 'completado',
  PENDIENTE_RESULTADOS = 'pendiente_resultados',
}

@Entity('medical_records')
export class MedicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'doctor_id' })
  doctor: User;

  @Column({ name: 'doctor_id' })
  doctorId: string;

  @ManyToOne(() => Appointment, { eager: true })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @Column({ name: 'appointment_id', unique: true })
  appointmentId: string;

  @Column()
  diagnosis: string;

  @Column({ nullable: true })
  treatment: string;

  @Column({ nullable: true })
  observations: string;

  @Column({ nullable: true })
  medications: string;

  @Column({ type: 'text', default: RecordStatus.COMPLETADO })
  status: RecordStatus;

  @OneToMany(() => Study, (study) => study.medicalRecord, { eager: true, cascade: true })
  studies: Study[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
