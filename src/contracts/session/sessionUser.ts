// The signed-in user as the server and the browser see it. Types only: no route validates
// this shape, because Better Auth produces it.
export type SessionUser = { readonly id: string; readonly name: string; readonly email: string };
