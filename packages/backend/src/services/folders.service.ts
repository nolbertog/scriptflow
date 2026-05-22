import { prisma } from './prisma';

export class FoldersService {
  async list(userId: number) {
    return prisma.folder.findMany({
      where: { userId },
      include: {
        _count: { select: { scripts: true, children: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getById(id: number, userId: number) {
    const folder = await prisma.folder.findFirst({
      where: { id, userId },
      include: {
        _count: { select: { scripts: true, children: true } },
        scripts: {
          select: { id: true, title: true, language: true, updatedAt: true },
        },
      },
    });
    if (!folder) throw new Error('Carpeta no encontrada');
    return folder;
  }

  async create(data: {
    name: string;
    color?: string;
    icon?: string;
    parentId?: number;
    userId: number;
  }) {
    const folder = await prisma.folder.create({
      data: {
        name: data.name,
        color: data.color || '#6366f1',
        icon: data.icon || 'folder',
        parentId: data.parentId,
        userId: data.userId,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'create',
        entity: 'folder',
        entityId: folder.id,
        details: JSON.stringify({ name: folder.name }),
        userId: data.userId,
      },
    });

    return folder;
  }

  async update(id: number, userId: number, data: {
    name?: string;
    color?: string;
    icon?: string;
    parentId?: number | null;
  }) {
    const folder = await prisma.folder.findFirst({ where: { id, userId } });
    if (!folder) throw new Error('Carpeta no encontrada');

    const updated = await prisma.folder.update({
      where: { id },
      data,
    });

    await prisma.auditLog.create({
      data: {
        action: 'update',
        entity: 'folder',
        entityId: id,
        details: JSON.stringify({ name: data.name }),
        userId,
      },
    });

    return updated;
  }

  async delete(id: number, userId: number) {
    const folder = await prisma.folder.findFirst({ where: { id, userId } });
    if (!folder) throw new Error('Carpeta no encontrada');

    // Move scripts to root before deleting folder
    await prisma.script.updateMany({
      where: { folderId: id },
      data: { folderId: null },
    });

    // Delete child folders
    await prisma.folder.deleteMany({
      where: { parentId: id, userId },
    });

    await prisma.folder.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'delete',
        entity: 'folder',
        entityId: id,
        details: JSON.stringify({ name: folder.name }),
        userId,
      },
    });
  }

  async tree(userId: number) {
    const folders = await prisma.folder.findMany({
      where: { userId },
      include: { _count: { select: { scripts: true } } },
      orderBy: { name: 'asc' },
    });

    // Build tree structure
    const folderMap = new Map<number, any>();
    const roots: any[] = [];

    folders.forEach((f) => {
      folderMap.set(f.id, { ...f, children: [] });
    });

    folders.forEach((f) => {
      const node = folderMap.get(f.id);
      if (f.parentId && folderMap.has(f.parentId)) {
        folderMap.get(f.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }
}
