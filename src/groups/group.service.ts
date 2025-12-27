import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { CreateGroupInput, UpdateGroupInput } from './dto/group.input';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
  ) {}

  // Tạo group mới gắn với user đang login
  create(createGroupInput: CreateGroupInput, userId: number) {
    const group = this.groupRepository.create({
      ...createGroupInput,
      userId,
    });
    return this.groupRepository.save(group);
  }

  // Lấy danh sách group của riêng user đó
  // src/groups/group.service.ts
  async findAll(userId: number) {
    return this.groupRepository.find({
      where: { userId },
      relations: ['user'], // Ép TypeORM Join với bảng User
    });
  }

  // Cập nhật group có check quyền
  async update(id: number, updateGroupInput: UpdateGroupInput, userId: number) {
    const group = await this.groupRepository.findOne({ where: { id } });

    if (!group) throw new NotFoundException('Không tìm thấy group');
    if (group.userId !== userId)
      throw new ForbiddenException('Bạn không có quyền sửa group này');

    Object.assign(group, updateGroupInput);
    return this.groupRepository.save(group);
  }

  // Xóa group có check quyền
  async remove(id: number, userId: number) {
    const group = await this.groupRepository.findOne({ where: { id } });

    if (!group) throw new NotFoundException('Không tìm thấy group');
    if (group.userId !== userId)
      throw new ForbiddenException('Bạn không có quyền xóa group này');

    await this.groupRepository.remove(group);
    return true;
  }
}
