export async function getEntity(entity: any, id: string, indexerName: string) {
  let item = await entity.loadEntity(id, indexerName);

  if (!item) {
    item = new entity(id, indexerName);
  }

  return item;
}
