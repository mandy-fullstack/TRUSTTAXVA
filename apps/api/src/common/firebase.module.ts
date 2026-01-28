import { Module, Global } from '@nestjs/common';
import { FirebaseService } from './services/firebase.service';

@Global()
@Module({
    providers: [FirebaseService],
    exports: [FirebaseService],
})
export class FirebaseModule { }
