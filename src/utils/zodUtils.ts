import { z } from  'zod';

export const getZodType = (typeName: string) => {
    switch (typeName) {
        case 'string':
            return z.string();
        case 'number':
            return z.number();
        case 'boolean':
            return z.boolean();
        case 'bigint':
            return z.bigint();
        case 'date':
            return z.date();
        case 'undefined':
            return z.undefined();
        case 'null':
            return z.null();
        case 'array':
            return z.array(z.any());
        case 'object':
            return z.object({});
        default:
            return z.unknown();
    }
}