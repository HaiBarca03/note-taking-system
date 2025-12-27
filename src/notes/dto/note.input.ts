import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateNoteInput {
  @Field()
  title: string;

  @Field({ nullable: true })
  content?: string;

  @Field(() => Int, { nullable: true })
  groupId?: number;
}

@InputType()
export class UpdateNoteInput {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  content?: string;

  @Field(() => Int, { nullable: true })
  groupId?: number;
}
