const Validator = {
    isNumber(x: any, range?: {start?: number | null, end?: number | null}): boolean {
        if (x === null || x === undefined) return false;
        const num = Number(x);
        if (isNaN(num)) return false;
        if (Validator.isNumber(range?.start) && num < range?.start!) return false;
        if (Validator.isNumber(range?.end) && num > range?.end!) return false;
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
    },

    isEmail(x: any): boolean {
        const regex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(x);
    },

    isNumberSequence(x: any, length: number): boolean {
        const regex: RegExp = new RegExp(`^\\d{${length},${length}}$`);
        return regex.test(x);
    }
};
export {Validator}
