import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';

@Injectable()
export class DocumentSequenceService {
  constructor(private prisma: PrismaService) {}

  async getNextNumber(
    branchId: string,
    module: string,
    documentType: string,
  ): Promise<string> {
    return this.prisma.$transaction(async (tx) => {
      let sequence = await tx.documentSequence.findUnique({
        where: {
          branchId_module_documentType: {
            branchId,
            module,
            documentType,
          },
        },
      });

      if (!sequence) {
        // Create default sequence if it doesn't exist
        sequence = await tx.documentSequence.create({
          data: {
            branchId,
            module,
            documentType,
            prefix: `${documentType.substring(0, 3).toUpperCase()}-`,
            nextNumber: 1,
            padding: 5,
          },
        });
      }

      const currentNumber = sequence.nextNumber;

      // Increment the sequence
      await tx.documentSequence.update({
        where: { id: sequence.id },
        data: {
          nextNumber: currentNumber + 1,
        },
      });

      // Format the document number
      const paddedNumber = currentNumber.toString().padStart(sequence.padding, '0');
      const suffix = sequence.suffix || '';

      return `${sequence.prefix}${paddedNumber}${suffix}`;
    });
  }

  async resetSequence(branchId: string, module: string, documentType: string) {
    return this.prisma.documentSequence.update({
      where: {
        branchId_module_documentType: {
          branchId,
          module,
          documentType,
        },
      },
      data: {
        nextNumber: 1,
      },
    });
  }
}
