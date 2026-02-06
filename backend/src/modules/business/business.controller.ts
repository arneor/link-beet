import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    UseGuards,
    Req,
    UploadedFile,
    UseInterceptors,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BusinessService } from './business.service';
import { CreateBusinessDto, UpdateBusinessDto } from './dto/business.dto';

@ApiTags('Business')
@Controller('business')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BusinessController {
    constructor(private readonly businessService: BusinessService) { }

    @Get('me')
    @ApiOperation({ summary: 'Get my business profile' })
    @ApiResponse({ status: 200, description: 'Business profile retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Business profile not found' })
    async getMyBusiness(@Req() req: any) {
        return this.businessService.getMyBusiness(req.user.id);
    }

    @Post()
    @ApiOperation({ summary: 'Create business profile' })
    @ApiResponse({ status: 201, description: 'Business profile created successfully' })
    @ApiResponse({ status: 400, description: 'User already has a business profile or invalid data' })
    async createBusiness(@Req() req: any, @Body() dto: CreateBusinessDto) {
        return this.businessService.createBusiness(req.user.id, dto);
    }

    @Patch('me')
    @ApiOperation({ summary: 'Update business profile' })
    @ApiResponse({ status: 200, description: 'Business profile updated successfully' })
    @ApiResponse({ status: 404, description: 'Business profile not found' })
    async updateBusiness(@Req() req: any, @Body() dto: UpdateBusinessDto) {
        return this.businessService.updateBusiness(req.user.id, dto);
    }

    @Post('me/logo')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload business logo' })
    async uploadLogo(
        @Req() req: any,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
                ],
            }),
        )
        file: Express.Multer.File,
    ) {
        return this.businessService.uploadLogo(req.user.id, file.buffer, file.originalname);
    }
}
