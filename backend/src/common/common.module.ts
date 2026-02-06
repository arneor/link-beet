import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './services/email.service';
import { UploadModule } from './upload/upload.module';
import { UsernameModule } from './username/username.module';

@Global()
@Module({
    imports: [
        ConfigModule,
        UploadModule,
        UsernameModule,
    ],
    providers: [EmailService],
    exports: [EmailService, UploadModule, UsernameModule],
})
export class CommonModule { }

