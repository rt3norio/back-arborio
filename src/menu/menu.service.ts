import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { MenuItem } from './entities/menu-item.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
  ) {}

  async findAll(customerId: string): Promise<Menu[]> {
    return this.menuRepository.find({ where: { customerId } });
  }

  async findOne(customerId: string, id: string): Promise<Menu> {
    const query = customerId === '*' ? { id } : { id, customerId };
    const menu = await this.menuRepository.findOne({ where: query });
    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }
    return menu;
  }

  async create(customerId: string, menuData: Partial<Menu>): Promise<Menu> {
    const menu = this.menuRepository.create({
      ...menuData,
      customerId,
      items: [],
    });
    return this.menuRepository.save(menu);
  }

  async update(
    customerId: string,
    id: string,
    menuData: Partial<Menu>,
  ): Promise<Menu> {
    const menu = await this.findOne(customerId, id);
    this.menuRepository.merge(menu, menuData);
    return this.menuRepository.save(menu);
  }

  async delete(customerId: string, id: string): Promise<void> {
    const result = await this.menuRepository.delete({ id, customerId });
    if (result.affected === 0) {
      throw new NotFoundException(
        `Menu with ID ${id} not found for customer ${customerId}`,
      );
    }
  }

  // Menu Items Management
  async addMenuItem(
    customerId: string,
    menuId: string,
    itemData: Partial<MenuItem>,
  ): Promise<Menu> {
    const menu = await this.findOne(customerId, menuId);
    const menuItem = this.menuItemRepository.create({
      ...itemData,
      menu,
    });
    await this.menuItemRepository.save(menuItem);
    return this.findOne(customerId, menuId);
  }

  async updateMenuItem(
    customerId: string,
    menuId: string,
    itemId: string,
    itemData: Partial<MenuItem>,
  ): Promise<Menu> {
    const menu = await this.findOne(customerId, menuId);
    const menuItem = menu.items.find((item) => item.id === itemId);
    if (!menuItem) {
      throw new NotFoundException(
        `Item with ID ${itemId} not found in menu ${menuId}`,
      );
    }

    await this.menuItemRepository.update(itemId, itemData);
    return this.findOne(customerId, menuId);
  }

  async deleteMenuItem(
    customerId: string,
    menuId: string,
    itemId: string,
  ): Promise<Menu> {
    const menu = await this.findOne(customerId, menuId);
    const menuItem = menu.items.find((item) => item.id === itemId);
    if (!menuItem) {
      throw new NotFoundException(
        `Item with ID ${itemId} not found in menu ${menuId}`,
      );
    }

    await this.menuItemRepository.delete(itemId);
    return this.findOne(customerId, menuId);
  }

  // Category Management
  async getCategories(customerId: string, menuId: string): Promise<string[]> {
    const menu = await this.findOne(customerId, menuId);
    return menu.categories;
  }

  async addCategory(
    customerId: string,
    menuId: string,
    category: string,
  ): Promise<Menu> {
    const menu = await this.findOne(customerId, menuId);
    if (!menu.categories.includes(category)) {
      menu.categories.push(category);
      return this.menuRepository.save(menu);
    }
    return menu;
  }

  async deleteCategory(
    customerId: string,
    menuId: string,
    category: string,
  ): Promise<Menu> {
    const menu = await this.findOne(customerId, menuId);
    menu.categories = menu.categories.filter((c) => c !== category);
    menu.items.forEach((item) => {
      if (item.category === category) {
        item.category = 'uncategorized';
      }
    });
    return this.menuRepository.save(menu);
  }

  async updateCategoryOrder(
    customerId: string,
    menuId: string,
    categoryOrder: string[],
  ): Promise<Menu> {
    const menu = await this.findOne(customerId, menuId);
    
    // Get current categories from items
    const categoriesFromItems = new Set<string>();
    menu.items.forEach((item) => {
      if (item.category) {
        categoriesFromItems.add(item.category);
      }
    });

    // Update categories array with the new order, keeping only categories that exist in items
    menu.categories = categoryOrder.filter((category) => categoriesFromItems.has(category));
    
    // Add any categories that exist in items but weren't in the order
    Array.from(categoriesFromItems).forEach((category) => {
      if (!menu.categories.includes(category)) {
        menu.categories.push(category);
      }
    });

    return this.menuRepository.save(menu);
  }
}
