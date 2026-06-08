import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionProperties } from "@/from-notion-property/from-notion-properties"
import { toNotionProperties } from "@/to-notion-property/to-notion-properties"
import type { NotionPropertySchema, SchemaType } from "@/types"

export class NotionPropertyConverter {
  fromNotion<T extends NotionPropertySchema>(
    schema: T,
    properties: PageObjectResponse["properties"],
  ): SchemaType<T> {
    return fromNotionProperties(schema, properties)
  }

  toNotion<T extends NotionPropertySchema, D extends Partial<SchemaType<T>>>(schema: T, data: D) {
    return toNotionProperties(schema, data)
  }
}
