import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { NoteService } from './notes.service';
import { Note } from './entities/note.entity';
import { CreateNoteInput, UpdateNoteInput } from './dto/note.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => Note)
@UseGuards(GqlAuthGuard)
export class NoteResolver {
  constructor(private readonly noteService: NoteService) {}

  @Mutation(() => Note)
  createNote(
    @Args('createNoteInput') createNoteInput: CreateNoteInput,
    @CurrentUser() user: User,
  ) {
    return this.noteService.create(createNoteInput, user.id);
  }

  @Query(() => [Note], { name: 'notes' })
  findAll(@CurrentUser() user: User) {
    return this.noteService.findAll(user.id);
  }

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

  @Mutation(() => Boolean)
  removeNote(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ) {
    return this.noteService.remove(id, user.id);
  }

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
}
