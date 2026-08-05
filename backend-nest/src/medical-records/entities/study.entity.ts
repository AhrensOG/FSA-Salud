import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MedicalRecord } from './medical-record.entity';

export enum StudyStatus {
  PENDIENTE = 'pendiente',
  COMPLETADO = 'completado',
}

@Entity('studies')
export class Study {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MedicalRecord, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'medical_record_id' })
  medicalRecord: MedicalRecord;

  @Column({ name: 'medical_record_id' })
  medicalRecordId: string;

  @Column()
  name: string;

  @Column({ type: 'text', default: StudyStatus.PENDIENTE })
  status: StudyStatus;

  @Column({ nullable: true })
  results: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
