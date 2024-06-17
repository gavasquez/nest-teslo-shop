import { BadRequestException, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileFilter, fileNamer } from './helpers';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Files - Get and Upload')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    /* limits: {
      fieldSize: 1000
    } */
    // Donde vamos a almacenar
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }))
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File
  ){ 
    // Se valida el file, porque si no pasa la validacion de la imagen entonces regresa undefined
    if(!file){
      throw new BadRequestException('Make sure that the file is an image');
    }
    // Se crea la url del endpoint de ver la imagen
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`
    return {
      secureUrl
    };
  }


  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response, // Rompe la funcionalidad del res, no queremos que tome el control de la respuesta, manualmente vamos a responder
    @Param('imageName') imageName: string
  ) {
    const path = this.filesService.getStatiProductImage(imageName);
    // Asi enviamos el archivo, para eso tomamos control de la Response
    res.sendFile(path);
  }

}
