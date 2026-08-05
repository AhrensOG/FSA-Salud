import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrescriptionsService } from './prescriptions.service';

@Controller('prescriptions')
@UseGuards(AuthGuard('jwt'))
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  create(
    @Request() req: any,
    @Body()
    body: {
      patientId: string;
      diagnosis: string;
      items: { medicationName: string; dosage: string; frequency: string; duration: string; quantity: number }[];
    },
  ) {
    return this.prescriptionsService.create(req.user.id, body);
  }

  @Get('pending')
  findPending(@Request() req: any) {
    return this.prescriptionsService.findPendingByPatient(req.user.id);
  }

  @Get('qr/:qrCode')
  findByQr(@Param('qrCode') qrCode: string) {
    return this.prescriptionsService.findByQrCode(qrCode);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.prescriptionsService.findById(id);
  }
}
