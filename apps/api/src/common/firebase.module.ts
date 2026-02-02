import { Module, Global } from '@nestjs/common';
import { FirebaseService } from './services/firebase.service';
import { StorageService } from './services/storage.service';

@Global()
@Module({
  providers: [FirebaseService, StorageService],
  exports: [FirebaseService, StorageService],
})
export class FirebaseModule {}
