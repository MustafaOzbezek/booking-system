import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { JwtService } from '@nestjs/jwt'
import { ConflictException, UnauthorizedException } from '@nestjs/common'

jest.mock('../db', () => ({
    db: {
        select: jest.fn().mockReturnValue({
            from: jest.fn().mockReturnValue({
                where: jest.fn().mockResolvedValue([]),
            }),
        }),
        insert: jest.fn().mockReturnValue({
            values: jest.fn().mockReturnValue({
                returning: jest.fn().mockResolvedValue([{
                    id: 'user-123',
                    name: 'Test User',
                    email: 'test@test.com',
                    password: 'hashed',
                }]),
            }),
        }),
    },
}))

jest.mock('bcryptjs', () => ({
    hash: jest.fn().mockResolvedValue('hashed_password'),
    compare: jest.fn().mockResolvedValue(true),
}))

describe('AuthService', () => {
    let service: AuthService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn().mockReturnValue('mock-token'),
                    },
                },
            ],
        }).compile()

        service = module.get<AuthService>(AuthService)
    })

    describe('register', () => {
        it('yeni kullanıcı kayıt etmeli ve token döndürmeli', async () => {
            const result = await service.register({
                name: 'Test User',
                email: 'test@test.com',
                password: '123456',
            })
            expect(result).toHaveProperty('token')
            expect(result).toHaveProperty('user')
            expect(result.user.email).toBe('test@test.com')
        })

        it('duplicate email için 409 hatası vermeli', async () => {
            const { db } = require('../db')
            db.insert.mockReturnValueOnce({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockRejectedValue({
                        cause: { code: '23505' },
                    }),
                }),
            })

            await expect(service.register({
                name: 'Test',
                email: 'test@test.com',
                password: '123456',
            })).rejects.toThrow(ConflictException)
        })
    })

    describe('login', () => {
        it('yanlış email için 401 hatası vermeli', async () => {
            const { db } = require('../db')
            db.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([]),
                }),
            })

            await expect(service.login({
                email: 'wrong@test.com',
                password: '123456',
            })).rejects.toThrow(UnauthorizedException)
        })

        it('yanlış şifre için 401 hatası vermeli', async () => {
            const { db } = require('../db')
            const bcrypt = require('bcryptjs')

            db.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([{
                        id: 'user-123',
                        email: 'test@test.com',
                        password: 'hashed',
                        name: 'Test',
                    }]),
                }),
            })
            bcrypt.compare.mockResolvedValueOnce(false)

            await expect(service.login({
                email: 'test@test.com',
                password: 'wrong',
            })).rejects.toThrow(UnauthorizedException)
        })
    })
})