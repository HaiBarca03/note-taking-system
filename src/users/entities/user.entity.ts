import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Note } from '../../notes/entities/note.entity';
import { Group } from '../../groups/entities/group.entity';
import { NoteShare } from '../../notes/entities/note-share.entity';

@ObjectType() // Để GraphQL hiểu đây là một Type
@Entity('users')
export class User {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  email: string;

  @Column() // Không có @Field() ở đây để bảo mật, password sẽ không bị leak qua GraphQL
  password: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => [Note], { nullable: true })
  @OneToMany(() => Note, (note) => note.user)
  notes: Note[];

  @Field(() => [Group], { nullable: true })
  @OneToMany(() => Group, (group) => group.user)
  groups: Group[];

  @Field(() => [NoteShare], { nullable: true })
  @OneToMany(() => NoteShare, (noteShare) => noteShare.recipient)
  sharedNotes: NoteShare[];
}
