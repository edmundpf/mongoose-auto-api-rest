declare const ONE_DAY: number;
declare const TOKEN_EXPIRY: number;
declare const objOmit: (obj: any, keys: Array<string>) => any;
declare const errorObj: (error: any) => {
    message: any;
    name: any;
    trace: any;
};
declare const parseDataSort: (query: any, aggregate?: boolean) => any;
declare const schemaAsync: (model: any) => Promise<{
    schema: string[];
    primary_key: any;
    list_fields: any;
    encrypt_fields: any;
    encode_fields: any;
    subdoc_fields: any;
}>;
declare const updateQuery: (req: any, primaryKey: any) => any;
declare const allowedPassword: (req: any) => true | {
    status: string;
    response: any;
};
declare const allowedSecretKey: (req: any) => true | {
    status: string;
    response: any;
};
declare const responseFormat: (method: any, args: any, res: any, spreadArgs?: boolean, lean?: boolean, count?: boolean) => Promise<any>;
declare const incorrectSecretKey: (res: any) => any;
declare const incorrectUserOrPass: (res: any) => any;
declare const userNotFound: (res: any) => any;
declare const noCurrentPass: (res: any) => any;
declare const signToken: (user: any, curToken: any) => {
    username: any;
    uid: any;
    access_token: any;
    expires_in: number;
};
declare const verifyToken: (req: any, res: any, next: any) => Promise<any>;
export { objOmit, errorObj, parseDataSort, schemaAsync, updateQuery, allowedPassword, allowedSecretKey, responseFormat, incorrectSecretKey, incorrectUserOrPass, userNotFound, noCurrentPass, signToken, verifyToken, ONE_DAY, TOKEN_EXPIRY, };
