import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './entities/note.entity';
import { NoteShare } from './entities/note-share.entity';
import { NoteService } from './notes.service';
import { NoteResolver } from './notes.resolver';
import { Group } from 'src/groups/entities/group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Note, NoteShare, Group])],
  providers: [NoteResolver, NoteService],
})
export class NotesModule {}
