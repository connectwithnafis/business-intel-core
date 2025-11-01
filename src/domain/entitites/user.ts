export class User {
  constructor(
    public id: string | null,
    public email: string,
    public passwordHash: string,
    public role: string = 'user'
  ) {}
}
