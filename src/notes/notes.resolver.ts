import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { NoteService } from './notes.service';
import { Note } from './entities/note.entity';
import { CreateNoteInput, UpdateNoteInput } from './dto/note.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { SharePermission } from './entities/note-share.entity';

@Resolver(() => Note)
export class NoteResolver {
  constructor(private readonly noteService: NoteService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Note)
  createNote(
    @Args('createNoteInput') createNoteInput: CreateNoteInput,
    @CurrentUser() user: User,
  ) {
    return this.noteService.create(createNoteInput, user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Note], { name: 'notes' })
  findAll(@CurrentUser() user: User) {
    return this.noteService.findAll(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Note)
  updateNote(
    @Args('updateNoteInput') updateNoteInput: UpdateNoteInput,
    @CurrentUser() user: User,
  ) {
    return this.noteService.update(
      updateNoteInput.id,
      updateNoteInput,
      user.id,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  removeNote(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ) {
    return this.noteService.remove(id, user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Note], { name: 'notesByGroup' })
  async getNotesByGroup(
    @Args('groupId', { type: () => Int }) groupId: number,
    @CurrentUser() user: User,
  ) {
    return this.noteService.findByGroup(groupId, user.id);
  }


  @Query(() => Note, { name: 'note' }) // Trả về 1 đối tượng Note duy nhất
  async findOne(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ) {
    return this.noteService.findOne(id, user.id);
  }
  
  @UseGuards(GqlAuthGuard)
  @Mutation(() => String)
  shareNote(
    @Args('id', { type: () => Int }) id: number,
    @Args('permission', { type: () => SharePermission })
    permission: SharePermission,
    @CurrentUser() user: User,
  ) {
    return this.noteService.shareNote(id, permission, user.id);
  }

  @Query(() => Note)
  sharedNote(@Args('token') token: string) {
    return this.noteService.findSharedNote(token);
  }

  @Mutation(() => Note)
  updateSharedNote(
    @Args('token') token: string,
    @Args('content') content: string,
  ) {
    return this.noteService.updateSharedNote(token, content);
  }
}
