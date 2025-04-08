const knownSmartphoneBrands = [
    'Apple',
    'Samsung',
    'Google',
    'OnePlus',
    'Xiaomi',
    'Huawei',
    'Sony',
    'Motorola',
    'Nokia',
];

const junkKeywords = [
    'case',
    'cover',
    'charger',
    'adapter',
    'screen protector',
    'cable',
    'mount',
    'holder',
    'accessory',
    'wallet',
    'glass',
    'dock',
    'stylus',
    'tripod',
    'watch',
    'ring',
    'clip',
    'skin',
];

export function isRealSmartphone(product) {
    if (!product || typeof product !== 'object') return false;

    const title = product.title?.toLowerCase() || '';
    const brand = product.brand || '';
    const priceRaw = product.price;

    let price = 0;
    try {
        price =
            typeof priceRaw === 'string'
                ? parseFloat(priceRaw.replace(',', '.').replace(/[^0-9.]/g, ''))
                : parseFloat(priceRaw);
    } catch {
        price = 0;
    }

    const passesBrandCheck = knownSmartphoneBrands.includes(brand);
    const passesPriceCheck = !isNaN(price) && price >= 100;
    const passesStorageCheck = product.storage_gb && product.storage_gb >= 32;
    const hasImage = !!product.image;

    const isJunk = junkKeywords.some((kw) => title.includes(kw));

    const isValid = !isJunk && passesBrandCheck && passesPriceCheck && passesStorageCheck && hasImage;

    if (!isValid) {
        console.log('[Filtered Out]', {
            title,
            brand,
            price,
            passesBrandCheck,
            passesPriceCheck,
            passesStorageCheck,
            hasImage,
            isJunk,
        });
    }

    return isValid;
}
