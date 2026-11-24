import { CataloguePage } from '@/components/CataloguePage'; import { getCatalogProducts } from '@/lib/catalog-server';
export const metadata={title:'Shop'};
export const dynamic = 'force-dynamic';
export default async function Shop(){return <CataloguePage products={await getCatalogProducts()} eyebrow="DIOC Collection" title="Modern, considered and made to last." intro="The complete DIOC edit, designed for a wardrobe with presence."/>}
