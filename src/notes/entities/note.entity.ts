import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Group } from '../../groups/entities/group.entity';
import { NoteShare } from './note-share.entity';

@ObjectType()
@Entity('notes')
export class Note {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  content: string;

  @Field()
  @Column({ default: false })
  isDeleted: boolean;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => Int)
  @Column()
  userId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.notes, { onDelete: 'CASCADE' })
  user: User;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  groupId: number;

  @Field(() => Group, { nullable: true })
  @ManyToOne(() => Group, (group) => group.notes, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  group: Group;

  @Field(() => [NoteShare], { nullable: true })
  @OneToMany(() => NoteShare, (noteShare) => noteShare.note)
  shares: NoteShare[];
}
