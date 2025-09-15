export function convertArrayToObject<T extends Record<string, any>>(array: T[], key: keyof T): Record<string, T> {
    return array.reduce((obj, item) => ({
        ...obj,
        [String(item[key])]: item,
    }), {});
} 