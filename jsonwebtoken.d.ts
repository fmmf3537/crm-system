/** Local typings so `next build` succeeds when @types/jsonwebtoken is not hoisted (e.g. some CI installs). */
declare module "jsonwebtoken" {
  export interface JwtPayload {
    sub?: string
    role?: string
    [key: string]: unknown
  }

  export interface SignOptions {
    expiresIn?: string | number
    algorithm?: string
  }

  export function sign(
    payload: string | Buffer | object,
    secretOrPrivateKey: string | Buffer,
    options?: SignOptions,
  ): string

  export function verify(
    token: string,
    secretOrPublicKey: string | Buffer,
    options?: object,
  ): JwtPayload | string

  /** CJS default export: `{ sign, verify, ... }` */
  const jwt: {
    sign: typeof sign
    verify: typeof verify
  }
  export default jwt
}
