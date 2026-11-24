export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dioc.eu.org';

export const siteConfig = { name: 'DIOC', slogan: 'TIMELESS STYLE. MODERN ELEGANCE.', phone: '+254753672051', whatsappNumber: '254753672051', whatsappLink(message:string) { return `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`; } };
