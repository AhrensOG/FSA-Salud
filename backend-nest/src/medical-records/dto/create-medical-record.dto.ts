import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class StudyItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  results?: string;
}
export class CreateMedicalRecordDto {
  @IsString()
  @IsNotEmpty()
  diagnosis: string;

  @IsString()
  @IsOptional()
  treatment?: string;

  @IsString()
  @IsOptional()
  observations?: string;

  @IsString()
  @IsOptional()
  medications?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudyItemDto)
  @IsOptional()
  studyItems?: StudyItemDto[];
}
