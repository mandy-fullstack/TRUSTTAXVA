import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PortalService } from './portal.service';

@Controller('portal')
export class PortalController {
  constructor(private readonly portalService: PortalService) { }

  /**
   * Public: Fetch metadata for a document request portal link.
   * Does NOT require auth; access is controlled by the one-time token.
   */
  @Get('document-request/:token')
  async getDocumentRequest(@Param('token') token: string) {
    return this.portalService.getDocumentRequestByToken(token);
  }

  /**
   * Public: Upload a document for a document request.
   * Does NOT require auth; access is controlled by the one-time token.
   */
  @Post('document-request/:token/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocumentForRequest(
    @Param('token') token: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('approvalId') approvalId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.portalService.uploadForDocumentRequest(token, file, approvalId);
  }
}

