import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { AiService } from "./apps/api/src/common/services/ai.service";

dotenv.config({ path: "./apps/api/.env" });

async function test() {
  const aiService = new AiService();
  (aiService as any).onModuleInit();

  const filePath = path.join(
    __dirname,
    "apps/api/src/common/services/2025 W2.pdf",
  );
  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    return;
  }

  const buffer = fs.readFileSync(filePath);
  const mimeType = "application/pdf";

  try {
    console.log("Testing W-2 extraction...");
    const result = await aiService.extractW2Data(buffer, mimeType);
    console.log("SUCCESS:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("FAILURE:", error);
  }
}

test();
