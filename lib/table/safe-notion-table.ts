import type { NotionPageReference } from "@/modules/notion-page-reference"
import type {
  BatchResult,
  CreateInput,
  FindOptions,
  NotionPropertySchema,
  UpdateInput,
  UpdateManyOptions,
  UpsertOptions,
  WhereCondition,
} from "@/types"
import type { NotionTable } from "@/table/notion-table"

type FindManyResult<T extends NotionPropertySchema> = {
  records: NotionPageReference<T>[]
  hasMore: boolean
  nextCursor: string | null
}

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e))
}

export type SafeNotionTable<T extends NotionPropertySchema> = {
  findMany(options?: FindOptions<T>): Promise<FindManyResult<T> | Error>
  findOne(
    options?: Omit<FindOptions<T>, "limit" | "cursor">,
  ): Promise<NotionPageReference<T> | null | Error>
  findById(id: string): Promise<NotionPageReference<T> | null | Error>
  create(input: CreateInput<T>): Promise<NotionPageReference<T> | Error>
  createMany(
    records: Array<CreateInput<T>>,
    options?: { concurrency?: number },
  ): Promise<BatchResult<NotionPageReference<T>> | Error>
  update(id: string, input: UpdateInput<T>): Promise<NotionPageReference<T> | Error>
  updateMany(options: UpdateManyOptions<T>): Promise<BatchResult<NotionPageReference<T>> | Error>
  upsert(options: UpsertOptions<T>): Promise<NotionPageReference<T> | Error>
  delete(id: string): Promise<void | Error>
  deleteMany(where?: WhereCondition<T>): Promise<BatchResult<string> | Error>
  restore(id: string): Promise<NotionPageReference<T> | Error>
}

export function createSafeNotionTable<T extends NotionPropertySchema>(
  table: NotionTable<T>,
): SafeNotionTable<T> {
  return {
    findMany: (options) => table.findMany(options).catch(toError),
    findOne: (options) => table.findOne(options).catch(toError),
    findById: (id) => table.findById(id).catch(toError),
    create: (input) => table.create(input).catch(toError),
    createMany: (records, options) => table.createMany(records, options).catch(toError),
    update: (id, input) => table.update(id, input).catch(toError),
    updateMany: (options) => table.updateMany(options).catch(toError),
    upsert: (options) => table.upsert(options).catch(toError),
    delete: (id) => table.delete(id).catch(toError),
    deleteMany: (where) => table.deleteMany(where).catch(toError),
    restore: (id) => table.restore(id).catch(toError),
  }
}
