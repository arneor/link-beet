// Catalog Controller - API endpoints for product/service catalogs
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    HttpCode,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiConsumes,
    ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CatalogService, CatalogItemData } from './catalog.service';
import {
    CreateCategoryDto,
    UpdateCategoryDto,
    CreateCatalogItemDto,
    UpdateCatalogItemDto,
} from './dto/catalog.dto';

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
    private readonly logger = new Logger(CatalogController.name);

    constructor(private readonly catalogService: CatalogService) { }

    // ==================== Public Endpoints ====================

    @Get('categories/:categoryId/items')
    @ApiOperation({ summary: 'Get public items in a category' })
    @ApiResponse({ status: 200, description: 'List of catalog items' })
    async getPublicItems(
        @Param('categoryId') categoryId: string,
    ): Promise<CatalogItemData[]> {
        return this.catalogService.getPublicItems(categoryId);
    }

    @Get('items/:itemId')
    @ApiOperation({ summary: 'Get single catalog item' })
    @ApiResponse({ status: 200, description: 'Catalog item details' })
    @ApiResponse({ status: 404, description: 'Item not found' })
    async getItem(@Param('itemId') itemId: string): Promise<CatalogItemData | null> {
        // Track view asynchronously
        this.catalogService.trackItemView(itemId).catch(() => { });
        return this.catalogService.getItem(itemId);
    }

    // ==================== Authenticated Category Endpoints ====================

    @Get('me/categories')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get my catalog categories' })
    async getMyCategories(@CurrentUser() user: any) {
        return this.catalogService.getMyCategories(user.sub);
    }

    @Post('me/categories')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Create a catalog category' })
    async createCategory(
        @CurrentUser() user: any,
        @Body() dto: CreateCategoryDto,
    ) {
        return this.catalogService.createCategory(user.sub, dto);
    }

    @Put('me/categories/:categoryId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Update a catalog category' })
    async updateCategory(
        @CurrentUser() user: any,
        @Param('categoryId') categoryId: string,
        @Body() dto: UpdateCategoryDto,
    ) {
        return this.catalogService.updateCategory(user.sub, categoryId, dto);
    }

    @Delete('me/categories/:categoryId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a catalog category' })
    async deleteCategory(
        @CurrentUser() user: any,
        @Param('categoryId') categoryId: string,
    ) {
        await this.catalogService.deleteCategory(user.sub, categoryId);
    }

    // ==================== Authenticated Item Endpoints ====================

    @Get('me/items')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get my catalog items' })
    @ApiQuery({ name: 'categoryId', required: false })
    async getMyItems(
        @CurrentUser() user: any,
        @Query('categoryId') categoryId?: string,
    ): Promise<CatalogItemData[]> {
        return this.catalogService.getMyItems(user.sub, categoryId);
    }

    @Post('me/items')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Create a catalog item' })
    async createItem(
        @CurrentUser() user: any,
        @Body() dto: CreateCatalogItemDto,
    ): Promise<CatalogItemData> {
        return this.catalogService.createItem(user.sub, dto);
    }

    @Put('me/items/:itemId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Update a catalog item' })
    async updateItem(
        @CurrentUser() user: any,
        @Param('itemId') itemId: string,
        @Body() dto: UpdateCatalogItemDto,
    ): Promise<CatalogItemData> {
        return this.catalogService.updateItem(user.sub, itemId, dto);
    }

    @Post('me/items/:itemId/image')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Upload item image' })
    @ApiConsumes('multipart/form-data')
    async uploadItemImage(
        @CurrentUser() user: any,
        @Param('itemId') itemId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.catalogService.uploadItemImage(
            user.sub,
            itemId,
            file.buffer,
            file.originalname,
        );
    }

    @Delete('me/items/:itemId/image')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete item image' })
    async deleteItemImage(
        @CurrentUser() user: any,
        @Param('itemId') itemId: string,
        @Body('imageUrl') imageUrl: string,
    ) {
        await this.catalogService.deleteItemImage(user.sub, itemId, imageUrl);
    }

    @Delete('me/items/:itemId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a catalog item' })
    async deleteItem(
        @CurrentUser() user: any,
        @Param('itemId') itemId: string,
    ) {
        await this.catalogService.deleteItem(user.sub, itemId);
    }
}
