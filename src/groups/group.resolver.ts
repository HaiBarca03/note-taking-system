import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { GroupService } from './group.service';
import { Group } from './entities/group.entity';
import { CreateGroupInput, UpdateGroupInput } from './dto/group.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => Group)
@UseGuards(GqlAuthGuard) // Bảo vệ toàn bộ các hàm trong resolver này
export class GroupResolver {
  constructor(private readonly groupService: GroupService) {}

  @Mutation(() => Group)
  createGroup(
    @Args('createGroupInput') createGroupInput: CreateGroupInput,
    @CurrentUser() user: User,
  ) {
    return this.groupService.create(createGroupInput, user.id);
  }

  @Query(() => [Group], { name: 'groups' })
  findAll(@CurrentUser() user: User) {
    console.log('Current User in findAll Groups:', user);
    return this.groupService.findAll(user.id);
  }

  @Mutation(() => Group)
  updateGroup(
    @Args('updateGroupInput') updateGroupInput: UpdateGroupInput,
    @CurrentUser() user: User,
  ) {
    return this.groupService.update(
      updateGroupInput.id,
      updateGroupInput,
      user.id,
    );
  }

  @Mutation(() => Boolean)
  removeGroup(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ) {
    return this.groupService.remove(id, user.id);
  }
}
