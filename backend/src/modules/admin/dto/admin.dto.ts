import { ApiProperty } from '@nestjs/swagger';

export class AdminStatsDto {
    @ApiProperty({ description: 'Total registered businesses' })
    totalBusinesses: number;

    @ApiProperty({ description: 'Total WiFi connections' })
    totalConnections: number;

    @ApiProperty({ description: 'Active ad campaigns' })
    totalActiveCampaigns: number;

    @ApiProperty({ description: 'Total emails collected' })
    totalEmailsCollected: number;

    @ApiProperty({ description: 'Platform growth rate' })
    growthRate?: number;
}

export class BusinessListItemDto {
    @ApiProperty({ description: 'Business ID' })
    id: string;

    @ApiProperty({ description: 'Business name' })
    businessName: string;

    @ApiProperty({ description: 'Owner phone' })
    ownerPhone?: string;

    @ApiProperty({ description: 'Location' })
    location?: string;

    @ApiProperty({ description: 'Category' })
    category?: string;

    @ApiProperty({ description: 'Number of ads' })
    adsCount: number;

    @ApiProperty({ description: 'Total connections' })
    connectionCount: number;

    @ApiProperty({ description: 'Active status' })
    isActive: boolean;

    @ApiProperty({ description: 'Created date' })
    createdAt: Date;
}
