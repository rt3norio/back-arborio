import { Controller, Get, Param } from '@nestjs/common';
import { MenuService } from './menu.service';
import { Menu } from './entities/menu.entity';

@Controller('public/menus')
export class PublicMenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get(':id')
  async getPublicMenu(@Param('id') id: string): Promise<Menu> {
    // For public access, we don't need the customerId - we'll find the menu directly by ID
    const menu = await this.menuService.findOne('*', id);
    return menu;
  }
}
