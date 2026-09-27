/**
 * The only thing the Poll module needs from a database: run one
 * parameterised SQL statement and get its rows back. Production uses Neon,
 * tests use an in-memory PGlite.
 */
export type Db = {
  query<T>(text: string, params?: unknown[]): Promise<T[]>;
};
