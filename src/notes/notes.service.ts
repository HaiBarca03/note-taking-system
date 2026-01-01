import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { Group } from '../groups/entities/group.entity';
import { CreateNoteInput, UpdateNoteInput } from './dto/note.input';
import { NoteShare, SharePermission } from './entities/note-share.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note) private noteRepository: Repository<Note>,
    @InjectRepository(Group) private groupRepository: Repository<Group>,
    @InjectRepository(NoteShare) private noteShareRepository: Repository<NoteShare>
  ) {}

  async create(createNoteInput: CreateNoteInput, userId: number) {
    // Nếu có groupId, phải check xem Group đó có phải của User này không
    if (createNoteInput.groupId) {
      const group = await this.groupRepository.findOne({
        where: { id: createNoteInput.groupId, userId },
      });
      if (!group)
        throw new ForbiddenException(
          'Bạn không có quyền gán note vào group này',
        );
    }

    const note = this.noteRepository.create({ ...createNoteInput, userId });
    return this.noteRepository.save(note);
  }

  findAll(userId: number) {
    return this.noteRepository.find({
      where: { userId, isDeleted: false },
      relations: ['group', 'user'],
    });
  }

  async update(id: number, updateNoteInput: UpdateNoteInput, userId: number) {
    const note = await this.noteRepository.findOne({ where: { id, userId } });
    if (!note)
      throw new NotFoundException(
        'Không tìm thấy ghi chú hoặc bạn không có quyền',
      );

    if (updateNoteInput.groupId) {
      const group = await this.groupRepository.findOne({
        where: { id: updateNoteInput.groupId, userId },
      });
      if (!group) throw new ForbiddenException('Group không hợp lệ');
    }

    Object.assign(note, updateNoteInput);
    return this.noteRepository.save(note);
  }

  async remove(id: number, userId: number) {
    const note = await this.noteRepository.findOne({ where: { id, userId } });
    if (!note) throw new NotFoundException('Không tìm thấy ghi chú');

    // Soft delete hoặc Hard delete tùy bạn, ở đây dùng Hard delete theo yêu cầu xóa
    await this.noteRepository.remove(note);
    return true;
  }

  // src/notes/notes.service.ts
  async findByGroup(groupId: number, userId: number) {
    // Check xem group này có phải của user này không để bảo mật
    const group = await this.groupRepository.findOne({
      where: { id: groupId, userId },
    });
    if (!group)
      throw new ForbiddenException(
        'Group không tồn tại hoặc không thuộc quyền sở hữu của bạn',
      );

    return this.noteRepository.find({
      where: { groupId, userId, isDeleted: false },
      relations: ['group'],
    });
  }

  async findOne(id: number, userId: number) {
    const note = await this.noteRepository.findOne({
      where: { id, userId, isDeleted: false },
      relations: ['group', 'user', 'shares'], // Load thêm các quan hệ nếu cần
    });

    if (!note) {
      throw new NotFoundException(`Không tìm thấy ghi chú với ID ${id}`);
    }

    return note;
  }

  async shareNote(
    noteId: number,
    permission: SharePermission,
    userId: number,
  ) {
    const note = await this.noteRepository.findOne({
      where: { id: noteId, userId, isDeleted: false },
    });

    if (!note) {
      throw new NotFoundException('Không tìm thấy note hoặc bạn không có quyền');
    }

    // 🔒 Nếu là EDIT → check đã tồn tại chưa
    if (permission === SharePermission.EDIT) {
      const existingEditShare = await this.noteShareRepository.findOne({
        where: {
          noteId,
          permission: SharePermission.EDIT,
        },
      });

      if (existingEditShare) {
        return existingEditShare.shareToken;
      }
    }

    const share = this.noteShareRepository.create({
      noteId,
      permission,
      shareToken: randomUUID(),
    });

    await this.noteShareRepository.save(share);

    return share.shareToken;
  }

  async findSharedNote(token: string) {
    const share = await this.noteShareRepository.findOne({
      where: { shareToken: token },
      relations: ['note'],
    });

    if (!share) {
      throw new NotFoundException('Link chia sẻ không hợp lệ');
    }

    if (![SharePermission.READ, SharePermission.EDIT].includes(share.permission)) {
      throw new ForbiddenException('Bạn không có quyền xem note này');
    }

    return share.note;
  }

  async updateSharedNote(token: string, content: string) {
    const share = await this.noteShareRepository.findOne({
      where: { shareToken: token },
      relations: ['note'],
    });

    if (!share) {
      throw new NotFoundException('Link chia sẻ không hợp lệ');
    }

    if (share.permission !== SharePermission.EDIT) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa note này');
    }

    share.note.content = content;
    return this.noteRepository.save(share.note);
  }
}
