import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ZodExceptionFilter } from './filters/zod-exception.filter'
import cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.use(cookieParser())
  app.useGlobalFilters(new ZodExceptionFilter())

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  })

  const port = process.env.PORT || 3001
  await app.listen(port)
  console.log(`API calisiyor: http://localhost:${port}`)
}

bootstrap()