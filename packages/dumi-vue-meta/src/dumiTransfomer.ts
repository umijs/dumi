import { AtomComponentAsset } from 'dumi-assets-types';
import {
  FunctionPropertySchema,
  ObjectPropertySchema,
  PropertySchema,
} from 'dumi-assets-types/typings/atom/props';
import { TypeMap } from 'dumi-assets-types/typings/atom/props/types';
import type {
  ComponentLibraryMeta,
  ComponentMeta,
  EventMeta,
  MetaTransformer,
  PropertyMeta,
  PropertyMetaSchema,
  SlotMeta,
} from './types';
import { PropertyMetaKind } from './types';
import { BasicTypes } from './utils';

function getPropertySchema(schema: PropertySchema | string) {
  if (typeof schema === 'string') {
    return {
      type: schema as keyof TypeMap,
    };
  }
  return schema;
}

export const dumiTransfomer: MetaTransformer<
  Record<string, AtomComponentAsset>
> = (meta: ComponentLibraryMeta) => {
  const referencedTypes = meta.types;
  const cachedTypes: Record<string, PropertySchema | string> = {};

  function createPropertySchema(prop: PropertyMeta | EventMeta | SlotMeta) {
    const partialProp: Partial<PropertySchema> = {
      title: prop.name,
      description: prop.description,
      tags: prop.tags,
    };
    let tagDef = prop?.tags?.default;
    let def: string | undefined;
    if (tagDef?.length) {
      def = tagDef[0];
    } else if (prop.default !== undefined) {
      def = prop.default;
    }

    if (def) {
      try {
        partialProp.default = JSON.parse(def.replaceAll("'", '"'));
      } catch (error) {}
    }

    const desc = prop?.tags?.['description'];
    if (desc?.length) {
      partialProp.description = desc.join('\n');
    }
    return {
      ...partialProp,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      ...getPropertySchema(transformSchema(prop.schema)),
    };
  }

  function transformSchema(
    schema: PropertyMetaSchema,
  ): PropertySchema | string {
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
        const cachedType = cachedTypes[schema.ref];
        if (cachedType) {
          return cachedType;
        }
        const type = transformSchema(referencedTypes[schema.ref]);
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
            arguments: functionSchema.arguments.map((arg) => ({
              key: arg.key,
              hasQuestionToken: !arg.required,
              type: arg.type,
            })),
            returnType: transformSchema(functionSchema.returnType),
          },
        } as FunctionPropertySchema;
      }
      case PropertyMetaKind.UNKNOWN:
        return schema.type;
    }
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
      methodsConfig: {
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

  return Object.entries(meta.components).reduce((result, [name, component]) => {
    result[name] = transformComponent(component);
    return result;
  }, {} as Record<string, AtomComponentAsset>);
};
