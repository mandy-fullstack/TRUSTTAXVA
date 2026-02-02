import {
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
} from '@nestjs/common';
import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

@Injectable()
export class AiService implements OnModuleInit {
  private g: any;

  onModuleInit() {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      console.warn(
        '⚠️ [AiService] GOOGLE_GENAI_API_KEY not found in environment. AI features will be disabled.',
      );
      return;
    }

    try {
      this.g = genkit({
        plugins: [googleAI({ apiKey })],
        model: 'googleai/gemini-flash-latest',
      });
      console.log(
        '✅ [AiService] Genkit initialized with googleai/gemini-flash-latest',
      );
    } catch (error) {
      console.error('❌ [AiService] Failed to initialize Genkit:', error);
    }
  }

  /**
   * Extract W-2 data from a document buffer (image or PDF).
   */
  async extractW2Data(fileBuffer: Buffer, mimeType: string) {
    if (!this.g) {
      throw new InternalServerErrorException(
        'AI Service not initialized. Check API Key.',
      );
    }

    try {
      // COMPREHENSIVE W-2 Schema - covering ALL IRS boxes for maximum extraction
      const W2Schema = z.object({
        // Employer Information
        employerName: z.string().describe('Name of the employer (top of form)'),
        employerAddress: z
          .string()
          .optional()
          .describe('Complete employer address with ZIP+4 if available'),
        employerEin: z
          .string()
          .optional()
          .describe('Employer Identification Number (Box b)'),

        // Employee Information
        taxpayerName: z.string().describe('Employee name (Box e)'),
        address: z
          .string()
          .optional()
          .describe('Complete employee address (Box f)'),
        taxpayerSsnMasked: z
          .string()
          .optional()
          .describe('Employee SSN masked as XXX-XX-#### (Box a)'),

        // Core Wage Information (Boxes 1-7)
        wages: z.number().describe('Wages, tips, other compensation (Box 1)'),
        federalWithholding: z
          .number()
          .describe('Federal income tax withheld (Box 2)'),
        socialSecurityWages: z
          .number()
          .optional()
          .describe('Social security wages (Box 3)'),
        socialSecurityWithheld: z
          .number()
          .optional()
          .describe('Social security tax withheld (Box 4)'),
        medicareWages: z
          .number()
          .optional()
          .describe('Medicare wages and tips (Box 5)'),
        medicareWithheld: z
          .number()
          .optional()
          .describe('Medicare tax withheld (Box 6)'),
        socialSecurityTips: z
          .number()
          .optional()
          .describe('Social security tips (Box 7)'),

        // Additional Boxes (8-14)
        allocatedTips: z.number().optional().describe('Allocated tips (Box 8)'),
        dependentCareBenefits: z
          .number()
          .optional()
          .describe('Dependent care benefits (Box 10)'),
        nonqualifiedPlans: z
          .number()
          .optional()
          .describe('Nonqualified plans (Box 11)'),
        box12Codes: z
          .array(
            z.object({
              code: z.string(),
              amount: z.number(),
            }),
          )
          .optional()
          .describe(
            'Box 12 codes and amounts (e.g., DD for employer health coverage)',
          ),
        statutoryEmployee: z
          .boolean()
          .optional()
          .describe('Statutory employee checkbox (Box 13)'),
        retirementPlan: z
          .boolean()
          .optional()
          .describe('Retirement plan checkbox (Box 13)'),
        thirdPartySickPay: z
          .boolean()
          .optional()
          .describe('Third-party sick pay checkbox (Box 13)'),
        box14Other: z
          .string()
          .optional()
          .describe('Other information from Box 14'),

        // State and Local (Boxes 15-20)
        stateCode: z
          .string()
          .optional()
          .describe('State abbreviation (Box 15)'),
        stateIdNumber: z
          .string()
          .optional()
          .describe('Employer state ID number (Box 15)'),
        stateWages: z
          .number()
          .optional()
          .describe('State wages, tips, etc (Box 16)'),
        stateWithholding: z
          .number()
          .optional()
          .describe('State income tax (Box 17)'),
        localWages: z
          .number()
          .optional()
          .describe('Local wages, tips, etc (Box 18)'),
        localTax: z.number().optional().describe('Local income tax (Box 19)'),
        localityName: z.string().optional().describe('Locality name (Box 20)'),

        // Document Metadata
        year: z.number().describe('Tax year of the W-2'),
        controlNumber: z
          .string()
          .optional()
          .describe('Control/Batch number if visible'),

        // Quality Assurance
        warnings: z
          .array(z.string())
          .optional()
          .describe('Any inconsistencies detected between copies'),
      });

      console.log(
        `🔍 [AiService] Starting W-2 analysis for mimeType: ${mimeType}, size: ${fileBuffer.length} bytes`,
      );

      const startTime = Date.now();
      const response = await this.g.generate({
        model: 'googleai/gemini-flash-latest',
        prompt: [
          {
            text: `You are performing a PROFESSIONAL TAX DOCUMENT EXTRACTION for a W-2 form. 
This document may contain MULTIPLE COPIES (Copy A, B, C, 2, etc.) of the same data. 

CRITICAL EXTRACTION GUIDELINES:

1. IRS BOX MAPPING (BOXES a-f & 1-20):
   - Box a: Employee's social security number (MASK as XXX-XX-####)
   - Box b: Employer identification number (EIN) - EXTRACT FULLY (e.g., 90-0683816)
   - Box c: Employer's name, address, and ZIP code - EXTRACT COMPLETE
   - Box d: Control number / Batch number - EXTRACT EXACTLY
   - Box e: Employee's name
   - Box f: Employee's address and ZIP code
   - Boxes 1-20: Extract all numeric and text values accurately.

2. PROFESSIONAL ACCURACY & DEDUPLICATION:
   - Identify if the image contains the same W-2 repeated multiple times.
   - Extract data ONCE from the clearer copy.
   - DO NOT SUM values from multiple copies of the SAME form.
   - For Box 15-20 (State/Local): If multiple DIFFERENT states exist, capture them. If same state is repeated in different copies, capture ONCE.

3. SECURITY & FORMATTING:
   - Numbers: Return as raw numbers (e.g., 13723.13), not strings.
   - Empty Boxes: Return null.
   - Checkboxes (Box 13): Return boolean true if marked.
   - Box 12: Capture all codes (e.g., C, D, E, DD) and their corresponding amounts as a structured array.

4. VALIDATION & YEAR DETECTION:
   - TAX YEAR: Look for the tax year (e.g., 2025) in large typography. It is often at the top-right, top-left, or printed vertically in the margins. If multiple years are visible, prefer the one explicitly labeled as the "Tax Year".
   - Cross-check values between copies. If "Box 1" shows $13,723.13 in all copies, ensure that is the value returned.
   - If there is any doubt or blurriness, note it in the "warnings" array.

Document analyzed: W-2 Form.
Return a clean, deduplicated JSON object.`,
          },
          {
            media: {
              url: `data:${mimeType};base64,${fileBuffer.toString('base64')}`,
              contentType: mimeType,
            },
          },
        ],
        output: { schema: W2Schema },
      });
      const duration = Date.now() - startTime;
      console.log(`✅ [AiService] Analysis completed in ${duration}ms`);

      return response.output;
    } catch (error: any) {
      console.error('❌ [AiService] AI Extraction Error Details:');
      console.error('   Message:', error.message);
      console.error('   Status:', error.status || error.code);

      // 429 - Quota Exceeded
      if (
        error.status === 429 ||
        error.message?.includes('429') ||
        error.message?.includes('Quota exceeded')
      ) {
        throw new InternalServerErrorException(
          '⚠️ Límite de IA excedido (Free Tier: 20 peticiones/día). Por favor intenta más tarde o actualiza a un plan con mayor cuota.',
        );
      }

      // 404 - Model Not Found (should be fixed now)
      if (error.status === 404 || error.message?.includes('404')) {
        throw new InternalServerErrorException(
          `El modelo de IA no está disponible o el nombre es incorrecto: ${error.message}`,
        );
      }

      throw new InternalServerErrorException(
        `Error en el análisis de IA: ${error.message}`,
      );
    }
  }
}
