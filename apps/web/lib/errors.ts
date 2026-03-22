export const ERROR_MESSAGES: Record<string, string> = {
    SLOT_ALREADY_BOOKED: 'Bu saat dilimi zaten dolu, lütfen başka bir saat seçin',
    PAST_TIME: 'Geçmiş saat için randevu alınamaz',
    PAST_DATE: 'Geçmiş tarih için randevu alınamaz',
    INVALID_DATE: 'Geçersiz tarih formatı',
    INVALID_CREDENTIALS: 'Email veya şifre hatalı',
    EMAIL_ALREADY_EXISTS: 'Bu email adresi zaten kullanımda',
    VALIDATION_ERROR: 'Lütfen tüm alanları doğru doldurun',
    USER_ALREADY_BOOKED: 'Bu gün için zaten bir randevunuz var',
}

export function getErrorMessage(errorCode: string, fallback = 'Bir hata oluştu'): string {
    return ERROR_MESSAGES[errorCode] || fallback
}