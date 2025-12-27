import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
  @Query(() => String)
  sayHello(): string {
    return 'Cổng GraphQL đã mở thành công!';
  }
}
