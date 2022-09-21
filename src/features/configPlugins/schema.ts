import type { IApi } from 'umi';

type JoiRoot = Parameters<
  NonNullable<NonNullable<Parameters<IApi['describe']>[0]['config']>['schema']>
>[0];

export function getSchemas(): Record<string, (Joi: JoiRoot) => any> {
  return {
    resolve: (Joi) =>
      Joi.object({
        docDirs: Joi.array().items(Joi.string()).optional(),
        entityDirs: Joi.array()
          .items(Joi.object({ type: Joi.string(), dir: Joi.string() }))
          .optional(),
        codeBlockMode: Joi.string().valid('active', 'passive').optional(),
      }).optional(),
  };
}
