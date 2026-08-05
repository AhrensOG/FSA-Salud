import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Prescription, PrescriptionStatus } from './entities/prescription.entity';
import { PrescriptionItem } from './entities/prescription-item.entity';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private readonly prescriptionsRepository: Repository<Prescription>,
    @InjectRepository(PrescriptionItem)
    private readonly itemsRepository: Repository<PrescriptionItem>,
  ) {}

  async create(
    doctorId: string,
    data: {
      patientId: string;
      diagnosis: string;
      items: { medicationName: string; dosage: string; frequency: string; duration: string; quantity: number }[];
    },
  ) {
    const qrCode = randomUUID();

    const prescription = this.prescriptionsRepository.create({
      doctorId,
      patientId: data.patientId,
      diagnosis: data.diagnosis,
      qrCode,
      status: PrescriptionStatus.PENDIENTE,
    });

    const saved = await this.prescriptionsRepository.save(prescription);

    const items = data.items.map((item) =>
      this.itemsRepository.create({ ...item, prescriptionId: saved.id }),
    );

    await this.itemsRepository.save(items);

    return saved;
  }

  async findPendingByPatient(patientId: string) {
    return this.prescriptionsRepository.find({
      where: { patientId, status: PrescriptionStatus.PENDIENTE },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string) {
    const prescription = await this.prescriptionsRepository.findOne({
      where: { id },
    });

    if (!prescription) {
      throw new NotFoundException('Receta no encontrada');
    }

    const items = await this.itemsRepository.find({
      where: { prescriptionId: id },
    });

    return { ...prescription, items };
  }

  async findByQrCode(qrCode: string) {
    const prescription = await this.prescriptionsRepository.findOne({
      where: { qrCode },
    });

    if (!prescription) {
      throw new NotFoundException('Receta no encontrada');
    }

    const items = await this.itemsRepository.find({
      where: { prescriptionId: prescription.id },
    });

    return { ...prescription, items };
  }
}
