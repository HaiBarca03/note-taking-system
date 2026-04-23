import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { GroupService } from './group.service';
import { Group } from './entities/group.entity';
import { Note } from '../notes/entities/note.entity';
import { CreateGroupInput, UpdateGroupInput } from './dto/group.input';
import { ForbiddenException, NotFoundException, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { SharePermission } from '../notes/entities/note-share.entity';

@Resolver(() => Group)
export class GroupResolver {
  constructor(private readonly groupService: GroupService) { }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Group)
  createGroup(
    @Args('createGroupInput') createGroupInput: CreateGroupInput,
    @CurrentUser() user: User,
  ) {
    return this.groupService.create(createGroupInput, user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Group], { name: 'groups' })
  findAll(
    @CurrentUser() user: User,
    @Args('includeDeleted', { type: () => Boolean, defaultValue: false })
    includeDeleted: boolean,
  ) {
    // console.log('Current User in findAll Groups:', user);
    return this.groupService.findAll(user.id, includeDeleted);
  }

  @UseGuards(GqlAuthGuard)
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

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  removeGroup(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ) {
    return this.groupService.remove(id, user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => String)
  shareGroup(
    @Args('id', { type: () => Int }) id: number,
    @Args('permission', { type: () => SharePermission })
    permission: SharePermission,
    @CurrentUser() user: User,
  ) {
    return this.groupService.shareGroup(id, permission, user.id);
  }

  @Query(() => Group, { name: 'sharedGroupByToken' })
  sharedGroupByToken(@Args('token') token: string) {
    return this.groupService.findSharedGroup(token);
  }

  @Query(() => Note, { name: 'sharedNoteInGroup' })
  async sharedNoteInGroup(
    @Args('token') token: string,
    @Args('noteId', { type: () => Int }) noteId: number,
  ) {
    const group = await this.groupService.findSharedGroup(token);
    const note = group.notes.find((n) => n.id === noteId);
    if (!note) {
      throw new NotFoundException('Ghi chú không tồn tại trong nhóm này');
    }
    return note;
  }

  @Query(() => SharePermission, { name: 'groupSharePermission' })
  async groupSharePermission(@Args('token') token: string) {
    const share = await this.groupService['groupShareRepository'].findOne({
      where: { shareToken: token },
    });
    if (!share) throw new NotFoundException('Token không hợp lệ');
    return share.permission;
  }

  @Mutation(() => Note)
  updateNoteInSharedGroup(
    @Args('token') token: string,
    @Args('noteId', { type: () => Int }) noteId: number,
    @Args('content') content: string,
  ) {
    return this.groupService.updateNoteInSharedGroup(token, noteId, content);
  }
}
