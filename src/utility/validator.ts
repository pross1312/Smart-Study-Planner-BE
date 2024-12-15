const Validator = {
    isNumber(x: any, range?: {start?: number, end?: number}): boolean {
        if (x === null || x === undefined) return false;
        const num = Number(x);
        if (isNaN(num)) return false;
        if (Validator.isValue(range?.start) && num < range?.start!) return false;
        if (Validator.isValue(range?.end) && num > range?.end!) return false;
        return true;
    },

    isEnum(value: any, enumObject: any): boolean {
        return Object.values(enumObject).includes(value);
    },

    parseBoolean(value: unknown): boolean | null {
        if (value === true || value === false) {
            return value;
        }
        if (value === 'true' || value === '1') {
            return true;
        }
        if (value === 'false' || value === '0') {
            return false;
        }
        return null; // Invalid boolean representation
    },

    isValue(x: any): boolean {
        return x !== null && x !== undefined;
    }
};
export {Validator}