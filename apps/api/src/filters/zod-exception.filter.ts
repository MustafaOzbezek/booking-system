import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common'
import { ZodError } from 'zod'

@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
    catch(exception: ZodError, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse()

        return response.status(400).json({
            error: 'VALIDATION_ERROR',
            message: exception.errors.map(e => e.message).join(', '),
        })
    }
}