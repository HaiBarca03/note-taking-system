import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Note } from '../../notes/entities/note.entity';

@ObjectType()
@Entity('groups')
export class Group {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field(() => Int)
  @Column()
  userId: number;

  @Field(() => Boolean)
  @Column({ default: false })
  isDeleted: boolean;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.groups, { onDelete: 'CASCADE' })
  user: User;

  @Field(() => [Note], { nullable: true })
  @OneToMany(() => Note, (note) => note.group)
  notes: Note[];
}
