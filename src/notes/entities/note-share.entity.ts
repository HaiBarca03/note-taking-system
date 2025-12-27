import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { Note } from './note.entity';
import { User } from '../../users/entities/user.entity';

export enum SharePermission {
  READ = 'READ',
  EDIT = 'EDIT',
}

// Đăng ký Enum với GraphQL
registerEnumType(SharePermission, {
  name: 'SharePermission',
});

@ObjectType()
@Entity('note_shares')
export class NoteShare {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  noteId: number;

  @Field(() => Note)
  @ManyToOne(() => Note, (note) => note.shares, { onDelete: 'CASCADE' })
  note: Note;

  @Field(() => Int)
  @Column()
  recipientId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.sharedNotes, { onDelete: 'CASCADE' })
  recipient: User;

  @Field(() => SharePermission)
  @Column({
    type: 'enum',
    enum: SharePermission,
    default: SharePermission.READ,
  })
  permission: SharePermission;
}
