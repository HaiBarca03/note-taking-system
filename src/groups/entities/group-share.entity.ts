import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Group } from './group.entity';
import { SharePermission } from '../../notes/entities/note-share.entity';

@ObjectType()
@Entity('group_shares')
export class GroupShare {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  groupId: number;

  @Field(() => Group)
  @ManyToOne(() => Group, (group) => group.shares, { onDelete: 'CASCADE' })
  group: Group;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  recipientId: number;

  @Field()
  @Column({ unique: true })
  shareToken: string;

  @Field(() => SharePermission)
  @Column({
    type: 'enum',
    enum: SharePermission,
    default: SharePermission.READ,
  })
  permission: SharePermission;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  expiredAt: Date;
}
