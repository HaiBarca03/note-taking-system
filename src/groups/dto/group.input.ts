import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateGroupInput {
  @Field()
  name: string;
}

@InputType()
export class UpdateGroupInput {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  name?: string;

  @Field(() => Boolean, { nullable: true })
  isDeleted?: boolean;
}
