import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductImage } from './product-image.entity';
import { User } from 'src/auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({
  name: 'products'
})
export class Product {

  @ApiProperty({
    example: '085e4f4d-2d62-47c7-b9df-608140ffb4f2',
    description: 'Product Id',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'T-Shirt Teslo',
    description: 'Product Title',
    uniqueItems: true,
  })
  @Column('text', {
    unique: true,
  })
  title: string;

  @ApiProperty({
    example: '0',
    description: 'Product Price',
  })
  @Column('float', {
    default: 0,
  })
  price: number;

  @ApiProperty({
    example: 'Nostrud voluptate velit voluptate magna aliquip velit fugiat velit laborum cupidatat dolore proident officia.',
    description: 'Product Description',
    default: null,
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  description:string;

  @ApiProperty({
    example: 't_shirt_teslo',
    description: 'Product SLUG - for SEO',
    uniqueItems: true,
  })
  @Column('text', {
    unique: true,
  })
  slug: string;

  @ApiProperty({
    example: 10,
    description: 'Product stock',
    default: 0,
  })
  @Column('int',{
    default: 0,
  })
  stock: number;

  @ApiProperty({
    example: ['M', 'XL', 'XXL'],
    description: 'Product sizes',
  })
  @Column('text', {
    array: true,
  })
  sizes: string[];

  @ApiProperty({
    example: 'women',
    description: 'Product gender',
  })
  @Column('text')
  gender: string;

  @ApiProperty()
  // tags
  @Column('text', {
    array: true,
    default: []
  })
  tags: string[];
  
  @ApiProperty()
  // images
  @OneToMany(
    () => ProductImage,
    (productImage) => productImage.product,
    {cascade: true, eager: true}
  )
  images?: ProductImage[];

  @ManyToOne(
    ()=> User,
    (user) => user.id,
    {eager: true} // Cargar automaticamente esta relación
  )
  user: User;

  // Antes de insertar
  @BeforeInsert()
  checkSlugInsert(){
    if(!this.slug){
        this.slug = this.title;
    }
    this.slug = this.slug
    .toLocaleLowerCase()
    .replaceAll(" ", "_")
    .replaceAll("'",'');
  }

  @BeforeUpdate()
  checkSlugUpdate(){
    this.slug = this.slug
    .toLocaleLowerCase()
    .replaceAll(" ", "_")
    .replaceAll("'",'');
  }

  /* @BeforeUpdate() */
}
