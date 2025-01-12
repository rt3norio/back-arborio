import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { Menu } from './entities/menu.entity';
import { MenuItem } from './entities/menu-item.entity';
import { Authentication, CognitoUser } from '@nestjs-cognito/auth';

@Controller('menus')
@Authentication()
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  async findAll(@CognitoUser('sub') userId: string): Promise<Menu[]> {
    return this.menuService.findAll(userId);
  }

  @Get(':id')
  async findOne(
    @CognitoUser('sub') userId: string,
    @Param('id') id: string,
  ): Promise<Menu> {
    console.log('findOne', userId, id);
    return this.menuService.findOne(userId, id);
  }

  @Post()
  async create(
    @CognitoUser('sub') userId: string,
    @Body() menuData: Partial<Menu>,
  ): Promise<Menu> {
    return this.menuService.create(userId, menuData);
  }

  @Put(':id')
  async update(
    @CognitoUser('sub') userId: string,
    @Param('id') id: string,
    @Body() menuData: Partial<Menu>,
  ): Promise<Menu> {
    return this.menuService.update(userId, id, menuData);
  }

  @Delete(':id')
  async delete(
    @CognitoUser('sub') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.menuService.delete(userId, id);
  }

  // Menu Items endpoints
  @Post(':id/items')
  async addMenuItem(
    @CognitoUser('sub') userId: string,
    @Param('id') menuId: string,
    @Body() item: Partial<MenuItem>,
  ): Promise<Menu> {
    return this.menuService.addMenuItem(userId, menuId, item);
  }

  @Put(':menuId/items/:itemId')
  async updateMenuItem(
    @CognitoUser('sub') userId: string,
    @Param('menuId') menuId: string,
    @Param('itemId') itemId: string,
    @Body() item: Partial<MenuItem>,
  ): Promise<Menu> {
    return this.menuService.updateMenuItem(userId, menuId, itemId, item);
  }

  @Delete(':menuId/items/:itemId')
  async deleteMenuItem(
    @CognitoUser('sub') userId: string,
    @Param('menuId') menuId: string,
    @Param('itemId') itemId: string,
  ): Promise<Menu> {
    return this.menuService.deleteMenuItem(userId, menuId, itemId);
  }

  // Categories endpoints
  @Get(':id/categories')
  async getCategories(
    @CognitoUser('sub') userId: string,
    @Param('id') menuId: string,
  ): Promise<string[]> {
    return this.menuService.getCategories(userId, menuId);
  }

  @Post(':id/categories')
  async addCategory(
    @CognitoUser('sub') userId: string,
    @Param('id') menuId: string,
    @Body('name') category: string,
  ): Promise<Menu> {
    return this.menuService.addCategory(userId, menuId, category);
  }

  @Delete(':id/categories/:category')
  async deleteCategory(
    @CognitoUser('sub') userId: string,
    @Param('id') menuId: string,
    @Param('category') category: string,
  ): Promise<Menu> {
    return this.menuService.deleteCategory(userId, menuId, category);
  }

  @Put(':id/category-order')
  async updateCategoryOrder(
    @CognitoUser('sub') userId: string,
    @Param('id') menuId: string,
    @Body('categoryOrder') categoryOrder: string[],
  ): Promise<Menu> {
    return this.menuService.updateCategoryOrder(userId, menuId, categoryOrder);
  }
}
