export function createSchemaRegistry(allSchemas) {
  const schemas = [...allSchemas];
  const schemaMap = new Map(schemas.map((schema) => [schema.resource, schema]));

  return {
    getSchema(resource) {
      return schemaMap.get(resource) || null;
    },

    getAllSchemas() {
      return schemas;
    },

    getSchemasByComponent(component) {
      return schemas.filter((schema) => schema.component === component);
    },

    findSchemas(query) {
      const lowered = String(query ?? '').trim().toLowerCase();
      if (!lowered) {
        return [];
      }

      return schemas.filter((schema) =>
        schema.resource.toLowerCase().includes(lowered) ||
        schema.description.toLowerCase().includes(lowered) ||
        schema.component.toLowerCase().includes(lowered) ||
        Object.keys(schema.actions).some((action) => action.toLowerCase().includes(lowered))
      );
    },

    listResources() {
      return schemas.map((schema) => ({
        resource: schema.resource,
        component: schema.component,
        description: schema.description,
        actions: Object.keys(schema.actions)
      }));
    }
  };
}
