import { Op, fn, col, where, literal } from 'sequelize';

function normalizeForMatch(text) {
    return text.replace(/\s+/g, '').toLowerCase();
}
export const getInsensitiveMatch = (name, filter) => {
    const normalizedInput = normalizeForMatch(name);

    let productfilter = {
        ...filter,
        ...(name && {
            [Op.and]: [where(fn('lower', fn('replace', col('name'), ' ', '')), normalizedInput)],
        }),
    };
    return productfilter;
};
