export type TargetAudience = 'men' | 'women' | 'boys' | 'girls' | 'unisex_kids' | 'unisex';
export type Product = { id: string; slug: string; name: string; gender: 'women'|'men'|'boys'|'girls'|'unisex'; targetAudience?: TargetAudience; collection?: string; createdAt?: string; category: string; type?: string; price: number; salePrice?: number; description: string; images: string[]; imagePositions?: string[]; sizes: string[]; colors: string[]; featured?: boolean; new?: boolean; sale?: boolean; available?: boolean; stock: number; };
export const products: Product[] = [];
export const formatKes=(value:number)=>new Intl.NumberFormat('en-KE',{style:'currency',currency:'KES',maximumFractionDigits:0}).format(value);
export const effectivePrice=(product:Product)=>product.sale && product.salePrice ? product.salePrice : product.price;
export const getProduct=(slug:string)=>products.find(p=>p.slug===slug);
export function compareNewestFirst(a: Product, b: Product) {
  const aTime = a.createdAt ? Date.parse(a.createdAt) : Number.NaN;
  const bTime = b.createdAt ? Date.parse(b.createdAt) : Number.NaN;
  return Number.isFinite(aTime) && Number.isFinite(bTime) ? bTime - aTime : 0;
}
