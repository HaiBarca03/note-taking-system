import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { GroupService } from './group.service';
import { GroupResolver } from './group.resolver';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { UsersRepository } from 'src/users/users.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Group])],
  providers: [GroupService, UsersRepository, GroupResolver, JwtStrategy],
})
export class GroupModule {}
