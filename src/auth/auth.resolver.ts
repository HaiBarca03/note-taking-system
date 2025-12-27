// src/auth/auth.resolver.ts
import {
  Resolver,
  Mutation,
  Args,
  ObjectType,
  Field,
  Query,
} from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthInput, RegisterInput } from './dto/auth.input';

@ObjectType()
class AuthResponse {
  @Field()
  access_token: string;
}

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Query(() => String)
  hello(): string {
    return 'Hello GraphQL!';
  }

  @Mutation(() => AuthResponse)
  async register(@Args('data') data: RegisterInput) {
    return this.authService.register(data);
  }

  @Mutation(() => AuthResponse)
  async login(@Args('data') data: AuthInput) {
    return this.authService.login(data);
  }
}
