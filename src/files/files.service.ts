import { join } from 'path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';

@Injectable()
export class FilesService {
  

  getStatiProductImage(imageName: string) {

    // Creamos el path donde se encuentra la imagen
    const path = join(__dirname, '../../static/products', imageName);

    if(!existsSync(path)) throw new BadRequestException(`No product found with image ${imageName}`);

    return path;
  }
}
