import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from "bcrypt";

@Injectable()
export class SeedService {

  constructor(
    private readonly porductsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepsoitory: Repository<User>, 
  ){}

  async runSeed(){
    await this.deleteTables();
    const adminUser = await this.insertUsers();
    await this.insertNewProducts(adminUser);
    return 'SEED Execute'
  }

  private async deleteTables(){
    await this.porductsService.deleteAllProducts();
    // Borrar Usuarios
    const queryBuilder = this.userRepsoitory.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }

  private async insertUsers(){
    const seedUser = initialData.users;
    const users: User[] = [];
    seedUser.forEach(user => {
      user.password = bcrypt.hashSync(user.password, 10);
      users.push(this.userRepsoitory.create(user));
    });
    const dbUsers = await this.userRepsoitory.save(seedUser);
    return dbUsers[0];
  }

  private async insertNewProducts(user: User){
    await this.porductsService.deleteAllProducts();
    const products = initialData.products;
    const insertPromise = [];
    products.forEach(product => {
      insertPromise.push(this.porductsService.create(product, user));
    }); 
    const results = await Promise.all(insertPromise);
    return true;
  }
}
