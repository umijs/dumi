import type { AtomComponentAsset, AtomFunctionAsset } from 'dumi-assets-types';
import type {
  BasePropertySchema,
  FunctionPropertySchema,
  ObjectPropertySchema,
  PropertySchema,
  ReferencePropertySchema,
} from 'dumi-assets-types/typings/atom/props';
import type { TypeMap } from 'dumi-assets-types/typings/atom/props/types';
import type {
  ComponentLibraryMeta,
  ComponentMeta,
  EventMeta,
  FuncPropertyMetaSchema,
  MetaTransformer,
  PropertyMeta,
  PropertyMetaSchema,
  SlotMeta,
  TypeParamPropertyMetaSchema,
} from './types';
import { PropertyMetaKind } from './types';
import { BasicTypes, getTag, isExternalRefSchema } from './utils';

function getPropertySchema(schema: PropertySchema | string) {
  if (typeof schema === 'string') {
    return {
      type: schema as keyof TypeMap,
    };
  }
  return schema;
}

export interface DumiTransformResult {
  components: Record<string, AtomComponentAsset>;
  functions: Record<string, AtomFunctionAsset>;
}

export const dumiTransformer: MetaTransformer<DumiTransformResult> = (
  meta: ComponentLibraryMeta,
) => {
  const referencedTypes = meta.types;
  const cachedTypes: Record<string, PropertySchema> = {};

  function createPropertySchema(prop: PropertyMeta | EventMeta | SlotMeta) {
    const partialProp: Partial<PropertySchema> = {
      title: prop.name,
      description: prop.description,
      tags: prop.comment,
    };
    let tagDef = getTag(prop.comment, 'default', 'block');
    let def: string | undefined;
    if (tagDef?.content) {
      def = tagDef.content[0]?.text;
    } else if (prop.default !== undefined) {
      def = prop.default;
    }

    if (def) {
      try {
        partialProp.default = JSON.parse(def.replaceAll("'", '"'));
      } catch (error) {}
    }

    const desc = getTag(prop.comment, 'description', 'block');
    if (desc?.content) {
      partialProp.description = desc.content
        .map((item) => item.text)
        .join('\n');
    }

    return {
      ...partialProp,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      ...getPropertySchema(transformSchema(prop.schema)),
    } as PropertySchema;
  }

  function transformSchema(schema: PropertyMetaSchema): PropertySchema {
    // It may not need to be checked, or it may be a basic type
    if (typeof schema === 'string') {
      const basicType = BasicTypes[schema];
      if (basicType) {
        return {
          type: basicType as any,
        };
      }
      return { type: schema as any };
    }
    switch (schema.kind) {
      case PropertyMetaKind.REF: {
        if (isExternalRefSchema(schema)) {
          const referenceSchema: ReferencePropertySchema = {
            type: 'reference',
            name: schema.name,
            externalUrl: schema.externalUrl,
          };
          if (schema.typeParams) {
            referenceSchema.typeParameters = schema.typeParams.map((param) =>
              transformSchema(param),
            );
          }
          return referenceSchema;
        }
        const cachedType = cachedTypes[schema.ref];
        if (cachedType) {
          return cachedType;
        }
        const referenceType = referencedTypes[schema.ref];
        const type = [
          PropertyMetaKind.ARRAY,
          PropertyMetaKind.OBJECT,
          PropertyMetaKind.FUNC,
          PropertyMetaKind.ENUM,
        ].includes(referenceType.kind)
          ? ({
              type: 'any',
              className: (referenceType as ObjectPropertySchema).type,
            } as BasePropertySchema<'any'>)
          : transformSchema(referenceType);
        if (referenceType.source) {
          type.source = referenceType.source;
        }
        cachedTypes[schema.ref] = type;
        return type;
      }
      case PropertyMetaKind.LITERAL:
        return {
          const: schema.value,
        };
      case PropertyMetaKind.BASIC:
        return {
          type: schema.type as any,
        };
      case PropertyMetaKind.ENUM:
        return {
          oneOf: (schema.schema || []).map((item) =>
            getPropertySchema(transformSchema(item)),
          ),
        };
      case PropertyMetaKind.ARRAY:
        return {
          type: 'array',
          items: schema.schema?.length
            ? getPropertySchema(transformSchema(schema.schema[0]))
            : undefined,
        };
      case PropertyMetaKind.OBJECT: {
        const required: string[] = [];
        const meta = {
          type: 'object',
          properties: Object.entries(schema.schema || {}).reduce(
            (acc, [name, prop]) => {
              if (prop.required) {
                required.push(prop.name);
              }
              acc[name] = createPropertySchema(prop);
              return acc;
            },
            {} as Record<string, PropertySchema>,
          ),
        } as ObjectPropertySchema;
        meta.required = required;
        return meta;
      }
      case PropertyMetaKind.FUNC: {
        const functionSchema = schema.schema!;
        return {
          type: 'function',
          signature: {
            isAsync: functionSchema.isAsync,
            arguments: functionSchema.arguments.map((arg) => {
              const argSchema = {
                key: arg.key,
                hasQuestionToken: !arg.required,
                schema: arg.schema
                  ? transformSchema(arg.schema)
                  : { type: 'any', className: arg.type },
              };
              return argSchema;
            }),
            returnType: transformSchema(functionSchema.returnType),
          },
        } as FunctionPropertySchema;
      }
      case PropertyMetaKind.TYPE_PARAM:
        return {
          type: 'any',
          className: (schema as TypeParamPropertyMetaSchema).name,
        };
      case PropertyMetaKind.UNKNOWN:
        return {
          type: 'any',
          className: schema.type,
        };
    }
  }

  function transformFunction(name: string, func: FuncPropertyMetaSchema) {
    const { signature } = transformSchema(func) as FunctionPropertySchema;
    const asset: AtomFunctionAsset = {
      type: 'FUNCTION',
      signature,
      id: name,
      title: name,
    };
    return asset;
  }

  function transformComponent(component: ComponentMeta) {
    const { props, events, slots, exposed } = component;
    const eventsFromProps: Record<string, PropertySchema> = {};
    const required: string[] = [];
    const properties = props.reduce((acc, prop) => {
      if (prop.required) {
        required.push(prop.name);
      }
      const match = prop.name.match(/^on([A-Z].*)$/);
      if (match) {
        // Discard excluded event prop
        if (prop.schema.kind === PropertyMetaKind.UNKNOWN) {
          return acc;
        }
        const eventName = match[1].toLowerCase();
        Object.assign(prop, { name: eventName });
        eventsFromProps[eventName] = createPropertySchema(prop);
      } else {
        acc[prop.name] = createPropertySchema(prop);
      }
      return acc;
    }, {} as Record<string, PropertySchema>);

    const asset: AtomComponentAsset = {
      type: 'COMPONENT',
      propsConfig: {
        type: 'object',
        properties,
      },
      slotsConfig: {
        type: 'object',
        properties: slots.reduce((acc, slot) => {
          acc[slot.name] = createPropertySchema(slot);
          return acc;
        }, {} as Record<string, PropertySchema>),
      },
      eventsConfig: {
        type: 'object',
        properties: events.reduce((acc, event) => {
          if (acc[event.name] === undefined) {
            acc[event.name] = createPropertySchema(event);
          }
          return acc;
        }, eventsFromProps),
      },
      imperativeConfig: {
        type: 'object',
        properties: exposed.reduce((acc, method) => {
          acc[method.name] = createPropertySchema(method);
          return acc;
        }, {} as Record<string, PropertySchema>),
      },
      id: component.name,
      title: component.name,
    };
    asset.propsConfig.required = required;
    return asset;
  }

  const result: DumiTransformResult = {
    functions: {},
    components: {},
  };

  Object.entries(meta.functions).reduce((acc, [name, func]) => {
    acc[name] = transformFunction(name, func);
    return acc;
  }, result.functions);
  Object.entries(meta.components).reduce((acc, [name, component]) => {
    acc[name] = transformComponent(component);
    return acc;
  }, result.components);

  return result;
};
