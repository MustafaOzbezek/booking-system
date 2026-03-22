'use client'

import Image from 'next/image'

export default function ConsultantProfile() {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {/* Profil Başlık */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">Mustafa Özbezek</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Full-Stack Developer · Yazılım Geliştirici · Teknoloji Tutkunu
                    </p>
                </div>
                <div className="ml-4">
                    <Image
                        src="/avatar.jpg"
                        alt="Mustafa Özbezek"
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                </div>
            </div>

            {/* Sosyal Medya */}
            <div className="flex gap-3 mb-6">
                <a href="#" className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold hover:bg-blue-700 transition">in</a>
                <a href="#" className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center text-white text-xs font-bold hover:bg-gray-900 transition">gh</a>
                <a href="#" className="w-8 h-8 bg-sky-400 rounded flex items-center justify-center text-white text-xs font-bold hover:bg-sky-500 transition">tw</a>
            </div>

            {/* Oturumlar için Müsait */}
            <div className="mb-4">
                <span className="text-sm font-semibold text-gray-700">Oturumlar için Müsait</span>
            </div>

            {/* Hakkında */}
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Hakkında</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                    Full-Stack geliştirme alanında uzmanlaşmış yazılım geliştirici.
                    Modern web teknolojileri ile kullanıcı odaklı ürünler geliştiriyorum.
                </p>
            </div>

            {/* Neler yapabilirim */}
            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Neler yapabilirim:</h3>
                <ul className="space-y-1">
                    {[
                        'Next.js ve React ile modern web uygulamaları',
                        'NestJS ile güçlü backend sistemleri',
                        'PostgreSQL ve Drizzle ORM ile veritabanı tasarımı',
                        'TypeScript ile type-safe geliştirme',
                        'API tasarımı ve entegrasyonu',
                        'Performans optimizasyonu',
                    ].map((item, i) => (
                        <li key={i} className="text-sm text-gray-500 flex items-center gap-2">
                            <span className="text-blue-500">·</span>
                            {item}
                        </li>
                    ))}
                </ul>
                <p className="text-sm text-gray-500 mt-3">
                    Yazılım geliştirmeye olan tutkumla her projede en iyi sonucu hedefliyorum.
                </p>
            </div>
        </div>
    )
}