import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../../email/email.service';

@Injectable()
export class PinService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  // 1. Verify Request (Pre-step: Validate password to allow PIN setup)
  // Actually, this is usually handled by the guard or password requirement on the controller.

  // 2. Setup PIN (First, check if already set? Or allow overwrite if they have password?)
  // If they have a PIN, they must use "Change PIN" or "Reset".
  // Setup is for new PINs.

  async setupPin(userId: string, pin: string) {
    // Enforce 6 alphanumeric chars
    if (!/^[A-Z0-9]{6}$/.test(pin)) {
      throw new BadRequestException(
        'PIN must be exactly 6 alphanumeric characters.',
      );
    }

    const user = (await this.prisma.user.findUnique({
      where: { id: userId },
    })) as any;
    if (user.pinHash && user.pinEnabled) {
      throw new BadRequestException('PIN is already set. Use change endpoint.');
    }

    const hash = await bcrypt.hash(pin, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        pinHash: hash,
        pinEnabled: true, // We enable immediately after "confirmation" (handled by frontend sending valid pin twice, or backend requiring 2 steps)
        // The user requested 2-step verification. "para configurar el pin seran 2 pasos de confirmacion"
        // Usually frontend handles "Enter PIN", "Confirm PIN", then sends to backend ONCE.
        // Sending to backend twice is redundant state. I will assume frontend validates match.
      },
    });

    // Send security alert email
    try {
      await this.emailService.sendPinActivatedEmail(
        user.email,
        user.name || user.firstName,
      );
    } catch (e) {
      console.error('Failed to send PIN confirmation email', e);
    }

    return { success: true, message: 'PIN configured successfully.' };
  }

  async verifyPin(userId: string, pin: string): Promise<boolean> {
    const user = (await this.prisma.user.findUnique({
      where: { id: userId },
    })) as any;

    if (!user.pinEnabled || !user.pinHash) {
      // If PIN is not setup, we block sensitive actions or prompt setup.
      // For verification purposes, this is a failure.
      return false;
    }

    const isValid = await bcrypt.compare(pin, user.pinHash);
    return isValid;
  }

  async changePin(userId: string, oldPin: string, newPin: string) {
    if (!/^[A-Z0-9]{6}$/.test(newPin)) {
      throw new BadRequestException(
        'New PIN must be 6 alphanumeric characters.',
      );
    }

    const user = (await this.prisma.user.findUnique({
      where: { id: userId },
    })) as any;
    if (!user.pinHash) {
      throw new BadRequestException('PIN not set up.');
    }

    const isValid = await bcrypt.compare(oldPin, user.pinHash);
    if (!isValid) {
      throw new ForbiddenException('Invalid current PIN.');
    }

    const newHash = await bcrypt.hash(newPin, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { pinHash: newHash },
    });

    return { success: true, message: 'PIN changed successfully.' };
  }

  // Helper to check if PIN is enabled
  async hasPin(userId: string) {
    const user = (await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pinEnabled: true },
    })) as any;
    return { hasPin: user?.pinEnabled || false };
  }
}
