import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { Note } from '../notes/entities/note.entity';
import { CreateGroupInput, UpdateGroupInput } from './dto/group.input';
import { GroupShare } from './entities/group-share.entity';
import { SharePermission } from '../notes/entities/note-share.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(GroupShare)
    private groupShareRepository: Repository<GroupShare>,
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
  ) {}

  // Tạo group mới gắn với user đang login
  create(createGroupInput: CreateGroupInput, userId: number) {
    const group = this.groupRepository.create({
      ...createGroupInput,
      isDeleted: false,
      userId,
    });
    return this.groupRepository.save(group);
  }

  // Lấy danh sách group của riêng user đó
  // src/groups/group.service.ts
  async findAll(userId: number, includeDeleted?: boolean) {
    return this.groupRepository.find({
      where:
        typeof includeDeleted === 'boolean'
          ? { userId, isDeleted: includeDeleted }
          : { userId }, // không truyền → lấy tất cả
      relations: ['user'],
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

  async shareGroup(
    groupId: number,
    permission: SharePermission,
    userId: number,
  ) {
    const group = await this.groupRepository.findOne({
      where: { id: groupId, userId, isDeleted: false },
    });

    if (!group) {
      throw new NotFoundException(
        'Không tìm thấy group hoặc bạn không có quyền',
      );
    }

    // Nếu đã tồn tại share cho permission này thì return luôn token cũ (hoặc tạo mới tùy ý)
    const existingShare = await this.groupShareRepository.findOne({
      where: { groupId, permission },
    });

    if (existingShare) {
      return existingShare.shareToken;
    }

    const share = this.groupShareRepository.create({
      groupId,
      permission,
      shareToken: randomUUID(),
    });

    await this.groupShareRepository.save(share);
    return share.shareToken;
  }

  async findSharedGroup(token: string) {
    const share = await this.groupShareRepository.findOne({
      where: { shareToken: token },
      relations: ['group', 'group.notes', 'group.user'],
    });

    if (!share) {
      throw new NotFoundException('Link chia sẻ không hợp lệ');
    }

    // Lọc bỏ các ghi chú đã bị xóa
    if (share.group && share.group.notes) {
      share.group.notes = share.group.notes.filter((note) => !note.isDeleted);
    }

    return share.group;
  }

  async updateNoteInSharedGroup(
    token: string,
    noteId: number,
    content: string,
  ) {
    const share = await this.groupShareRepository.findOne({
      where: { shareToken: token },
    });

    if (!share) {
      throw new NotFoundException('Link chia sẻ không hợp lệ');
    }

    if (share.permission !== SharePermission.EDIT) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa nhóm này');
    }

    const note = await this.noteRepository.findOne({
      where: { id: noteId, groupId: share.groupId },
    });

    if (!note) {
      throw new NotFoundException('Ghi chú không tồn tại trong nhóm này');
    }

    note.content = content;
    return this.noteRepository.save(note);
  }
}
