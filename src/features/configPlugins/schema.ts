import type { IApi } from 'umi';

type JoiRoot = Parameters<
  NonNullable<NonNullable<Parameters<IApi['describe']>[0]['config']>['schema']>
>[0];

function getUnifiedPluginSchema(Joi: JoiRoot) {
  return Joi.array()
    .items(
      Joi.alternatives(
        Joi.string(),
        Joi.func(),
        Joi.array()
          .items(Joi.alternatives(Joi.string(), Joi.func()), Joi.object())
          .length(2),
      ),
    )
    .optional();
}

export function getSchemas(): Record<string, (Joi: JoiRoot) => any> {
  return {
    resolve: (Joi) =>
      Joi.object({
        docDirs: Joi.array()
          .items(
            Joi.alternatives(
              Joi.string(),
              Joi.object({ dir: Joi.string(), type: Joi.string().optional() }),
            ),
          )
          .optional(),
        atomDirs: Joi.array()
          .items(Joi.object({ type: Joi.string(), dir: Joi.string() }))
          .optional(),
        entityDirs: Joi.forbidden().error(
          new Error(
            '`entityDirs` is already deprecated, please rename it to `atomDirs` in `.dumirc.ts`',
          ),
        ),
        codeBlockMode: Joi.string().valid('active', 'passive').optional(),
        entryFile: Joi.string().optional(),
        forceKebabCaseRouting: Joi.bool().optional(),
      }).optional(),
    extraRemarkPlugins: getUnifiedPluginSchema,
    extraRehypePlugins: getUnifiedPluginSchema,
    themeConfig: (Joi) => Joi.object().optional(),
    logo: (Joi) => Joi.string(),
  };
}
