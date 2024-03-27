import type {
  TypeScriptLanguageHost,
  VueCompilerOptions,
} from '@vue/language-core';
import { VueFile } from '@vue/language-core';
import type ts from 'typescript/lib/tsserverlibrary';
import { SchemaResolver } from '../schemaResolver/index';
import {
  CommentMeta,
  TypeMeta,
  type ComponentLibraryMeta,
  type ComponentMeta,
  type MetaCheckerOptions,
  type MetaTransformer,
  type PropertyMeta,
  type SingleComponentMeta,
} from '../types';
import { getComment, getTag } from '../utils';
import {
  createVueLanguageService,
  type VueLanguageService,
} from './createVueLanguageService';
import {
  getExports,
  getFunctionSignatures,
  isFunctionalVueComponent,
  readTsComponentDefaultProps,
  readVueComponentDefaultProps,
} from './helpers';
import type { Repo } from './repo';

/**
 * Provide component metadata checker services
 * @group project.service
 */
export class TypeCheckService {
  private langService!: VueLanguageService;
  private globalPropNames?: string[];
  private options!: MetaCheckerOptions;

  constructor(
    private readonly ts: typeof import('typescript/lib/tsserverlibrary'),
    checkerOptions: MetaCheckerOptions,
    private vueCompilerOptions: VueCompilerOptions,
    private globalComponentName: string,
    _host: TypeScriptLanguageHost,
    private repo: Repo,
  ) {
    this.options = Object.assign(
      {
        forceUseTs: true,
        printer: { newLine: 1 },
        filterGlobalProps: true,
        filterExposed: true,
      },
      checkerOptions,
    );

    this.langService = createVueLanguageService(
      ts,
      _host,
      this.options,
      vueCompilerOptions,
      globalComponentName,
    );
  }

  get $tsLs() {
    return this.langService.tsLs;
  }

  private getType(
    typeChecker: ts.TypeChecker,
    symbolProperties: ts.Symbol[],
    symbolNode: ts.Expression,
  ) {
    const $type = symbolProperties.find((prop) => prop.escapedName === 'type');

    if ($type) {
      const type = typeChecker.getTypeOfSymbolAtLocation($type, symbolNode!);
      return Number(typeChecker.typeToString(type));
    }

    return 0;
  }

  private getProps(
    typeChecker: ts.TypeChecker,
    symbolProperties: ts.Symbol[],
    symbolNode: ts.Expression,
    resolver: SchemaResolver,
    componentPath: string,
    exportName: string,
  ) {
    const {
      ts,
      options,
      langService,
      globalComponentName,
      vueCompilerOptions,
    } = this;
    const { core, host } = langService;
    const $props = symbolProperties.find(
      (prop) => prop.escapedName === 'props',
    );
    // const propEventRegex = /^(on[A-Z])/;
    let result: PropertyMeta[] = [];

    if ($props) {
      const type = typeChecker.getTypeOfSymbolAtLocation($props, symbolNode!);
      const properties = type.getProperties().filter((slot) => {
        const tags = getComment(ts, typeChecker, slot);
        return !this.shouldIgnore(tags);
      });

      result = properties.map((prop) => {
        return resolver.resolveNestedProperties(prop);
      });
      // .filter((prop) => !prop.name.match(propEventRegex)); // Here, props starting with on are excluded.
    }

    // fill global
    if (componentPath !== globalComponentName) {
      this.globalPropNames ??= this.getComponentMeta(
        globalComponentName,
      ).component.props.map((prop) => prop.name);
      if (options.filterGlobalProps) {
        result = result.filter(
          (prop) => !(this.globalPropNames as string[]).includes(prop.name),
        );
      } else {
        for (const prop of result) {
          prop.global = (this.globalPropNames as string[]).includes(prop.name);
        }
      }
    }

    // fill defaults
    const printer = ts.createPrinter(options.printer);
    const snapshot = host.getScriptSnapshot(componentPath)!;

    const vueSourceFile = core.virtualFiles.getSource(componentPath)?.root;
    const vueDefaults =
      vueSourceFile && exportName === 'default'
        ? vueSourceFile instanceof VueFile
          ? readVueComponentDefaultProps(
              vueSourceFile,
              printer,
              ts,
              vueCompilerOptions,
            )
          : {}
        : {};
    const tsDefaults = !vueSourceFile
      ? readTsComponentDefaultProps(
          componentPath.substring(componentPath.lastIndexOf('.') + 1), // ts | js | tsx | jsx
          snapshot.getText(0, snapshot.getLength()),
          exportName,
          printer,
          ts,
        )
      : {};

    for (const [propName, defaultExp] of Object.entries({
      ...vueDefaults,
      ...tsDefaults,
    })) {
      const prop = result.find((p) => p.name === propName);
      if (prop) {
        prop.default = defaultExp.default;

        if (defaultExp.required !== undefined) {
          prop.required = defaultExp.required;
        }

        if (prop.default !== undefined) {
          prop.required = false; // props with default are always optional
        }
      }
    }

    return result;
  }

  private getEvents(
    typeChecker: ts.TypeChecker,
    symbolProperties: ts.Symbol[],
    symbolNode: ts.Expression,
    resolver: SchemaResolver,
  ) {
    const $emit = symbolProperties.find((prop) => prop.escapedName === 'emit');

    if ($emit) {
      const type = typeChecker.getTypeOfSymbolAtLocation($emit, symbolNode!);
      const calls = type.getCallSignatures();

      return calls
        .map((call) => {
          return resolver.resolveEventSignature(call);
        })
        .filter((event) => event.name);
    }

    return [];
  }

  private getSlots(
    typeChecker: ts.TypeChecker,
    symbolProperties: ts.Symbol[],
    symbolNode: ts.Expression,
    resolver: SchemaResolver,
  ) {
    const { ts } = this;
    const $slots = symbolProperties.find(
      (prop) => prop.escapedName === 'slots',
    );

    if ($slots) {
      const type = typeChecker.getTypeOfSymbolAtLocation($slots, symbolNode!);
      const properties = type.getProperties().filter((slot) => {
        const comment = getComment(ts, typeChecker, slot);
        return !this.shouldIgnore(comment);
      });

      return properties.map((prop) => {
        return resolver.resolveSlotProperties(prop);
      });
    }

    return [];
  }

  private shouldPublic({ modifierTags, blockTags }: CommentMeta) {
    if (modifierTags) {
      for (let index = 0; index < modifierTags.length; index++) {
        const tag = modifierTags[index];
        switch (tag) {
          case 'public':
          case 'experimental':
          case 'alpha':
          case 'beta':
            return true;
          default:
            continue;
        }
      }
    }
    if (blockTags) {
      for (let index = 0; index < blockTags.length; index++) {
        const { tag } = blockTags[index];
        if (tag === 'deprecated') return true;
        continue;
      }
    }
    return false;
  }

  private shouldIgnore(comment: CommentMeta) {
    return !!comment.modifierTags?.find(
      (tag) => tag === 'ignore' || tag === 'internal',
    );
  }

  private getExposed(
    typeChecker: ts.TypeChecker,
    symbolProperties: ts.Symbol[],
    symbolNode: ts.Expression,
    resolver: SchemaResolver,
  ) {
    const { ts, options } = this;
    const $exposed = symbolProperties.find(
      (prop) => prop.escapedName === 'exposed',
    );

    if ($exposed) {
      const type = typeChecker.getTypeOfSymbolAtLocation($exposed, symbolNode!);
      if (!type.getProperty('$props')) {
        throw 'This is not a vue component';
      }
      let outsideProps: string[] = [];
      if (options.filterExposed) {
        const $props = symbolProperties.find(
          (prop) => prop.escapedName === 'props',
        );
        if ($props) {
          const type = typeChecker.getTypeOfSymbolAtLocation(
            $props,
            symbolNode!,
          );
          outsideProps = type.getProperties().map((s) => s.getName());
        }
      }
      const properties = type.getProperties().filter((prop) => {
        const comment = getComment(ts, typeChecker, prop);
        if (this.shouldIgnore(comment)) return false;
        if (options.filterExposed) {
          return (
            this.shouldPublic(comment) && !outsideProps.includes(prop.getName())
          );
        }
        // It can also be entered if it is marked as public.
        if (prop.valueDeclaration && this.shouldPublic(comment)) {
          return true;
        }
        // only exposed props will not have a valueDeclaration
        return !(prop as any).valueDeclaration;
      });

      return properties.map((prop) => {
        return resolver.resolveExposedProperties(prop);
      });
    }
    return [];
  }

  /**
   * only get value export
   */
  public getExportNames(componentPath: string) {
    return this.getExported(componentPath, false).exports.map((e) =>
      e.getName(),
    );
  }

  /**
   * Get the export
   * @param componentPath
   * @param exportedTypes Whether to export all types
   */
  public getExported(componentPath: string, exportedTypes = true) {
    const { ts, langService } = this;
    const program = langService.tsLs.getProgram()!;
    const typeChecker = program.getTypeChecker();
    return getExports(ts, program, typeChecker, componentPath, exportedTypes);
  }

  private createComponentMeta(
    init: Partial<ComponentMeta>,
    props: {
      type: () => ComponentMeta['type'];
      props: () => ComponentMeta['props'];
      events: () => ComponentMeta['events'];
      slots: () => ComponentMeta['slots'];
      exposed: () => ComponentMeta['exposed'];
    },
  ): ComponentMeta {
    return Object.entries(props).reduce((meta, [prop, get]) => {
      Object.defineProperty(meta, prop, {
        get,
        enumerable: true,
        configurable: true,
      });
      return meta;
    }, init as ComponentMeta);
  }

  /**
   * Get component metadata through the entry file,
   * this method will automatically filter vue components
   * @param entry Entry file, export all components and types
   * @returns ComponentLibraryMeta
   * @example
   * ```ts
   * import { dumiTransfomer, createProject } from '@dumijs/vue-meta';
   * const project = createProject({
   *   tsconfigPath: '<project-root>/tsconfig.json',
   *   checkerOptions,
   * });
   * // `dumiTransfomer` will convert the original metadata into metadata adapted to dumi
   * project.service.getComponentLibraryMeta(entry, dumiTransfomer);
   * ```
   */
  public getComponentLibraryMeta<T = ComponentLibraryMeta>(
    entry: string,
    transformer?: MetaTransformer<T>,
  ): T {
    const { langService, ts, options, repo } = this;
    const program = langService.tsLs.getProgram()!;
    const typeChecker = program.getTypeChecker();
    const { symbolNode, exports, exportedTypes } = getExports(
      ts,
      program,
      typeChecker,
      entry,
      true,
    );

    const typeResolver = new SchemaResolver(
      ts,
      typeChecker,
      langService,
      symbolNode,
      repo,
      options,
    );

    typeResolver.preResolve(exportedTypes);

    const meta: ComponentLibraryMeta = {
      components: {},
      types: {},
      functions: {},
    };

    exports.reduce((acc, _export) => {
      const exportedName = _export.getName();
      const comment = getComment(ts, typeChecker, _export);
      // can be identified by jsdoc
      // sometimes some composition functions or generic component may be similar to functional components,
      // they can be distinguished by @component
      if (
        !getTag(comment, 'component', 'block') &&
        !isFunctionalVueComponent(typeChecker, _export)
      ) {
        const functionMeta = this.getFunctionMeta(
          typeChecker,
          _export,
          typeResolver,
        );
        if (functionMeta) {
          acc.functions[exportedName] = functionMeta;
          return acc;
        }
      }
      try {
        const meta = this.getSingleComponentMeta(
          typeChecker,
          symbolNode,
          _export,
          entry,
          exportedName,
          typeResolver,
        );
        acc.components[exportedName] = meta;
      } catch (error) {}
      return acc;
    }, meta);

    meta.types = typeResolver.getTypes();

    return transformer ? transformer(meta) : (meta as T);
  }

  private getFunctionMeta(
    typeChecker: ts.TypeChecker,
    exportSymbol: ts.Symbol,
    resolver: SchemaResolver,
  ) {
    const signatures = getFunctionSignatures(typeChecker, exportSymbol);
    if (!signatures.length) {
      return null;
    }
    return resolver.createSignatureMetaSchema(signatures[0]);
  }

  private getSingleComponentMeta(
    typeChecker: ts.TypeChecker,
    symbolNode: ts.Expression,
    exportSymbol: ts.Symbol,
    componentPath: string,
    exportName: string,
    resolver: SchemaResolver,
  ) {
    const componentType = typeChecker.getTypeOfSymbolAtLocation(
      exportSymbol,
      symbolNode!,
    );
    const symbolProperties = componentType.getProperties();

    let _type: ComponentMeta['type'] = this.getType(
      typeChecker,
      symbolProperties,
      symbolNode,
    );
    const functional = _type === TypeMeta.Function;
    if (_type === TypeMeta.Unknown) {
      throw new Error('This is not a vue component');
    }
    const initComponentMeta: Partial<ComponentMeta> = {
      name: exportName,
    };
    if (_type === TypeMeta.Function) {
      const signature = getFunctionSignatures(typeChecker, exportSymbol);
      const typeParams = signature[0].getTypeParameters();
      if (typeParams?.length) {
        initComponentMeta.typeParams = typeParams.map((param) =>
          resolver.resolveSchema(param),
        );
      }
    }
    let _props: ComponentMeta['props'] | undefined;
    let _events: ComponentMeta['events'] | undefined;
    let _slots: ComponentMeta['slots'] | undefined;
    let _exposed: ComponentMeta['exposed'] | undefined;
    return this.createComponentMeta(initComponentMeta, {
      type: () => _type,
      props: () =>
        _props ??
        (_props = this.getProps(
          typeChecker,
          symbolProperties,
          symbolNode,
          resolver,
          componentPath,
          exportName,
        )),
      events: () =>
        _events ??
        (_events = this.getEvents(
          typeChecker,
          symbolProperties,
          symbolNode,
          resolver,
        )),
      slots: () =>
        _slots ??
        (_slots = this.getSlots(
          typeChecker,
          symbolProperties,
          symbolNode,
          resolver,
        )),
      exposed: () =>
        !functional
          ? _exposed ??
            (_exposed = this.getExposed(
              typeChecker,
              symbolProperties,
              symbolNode,
              resolver,
            ))
          : [],
    });
  }

  /**
   * Get metadata of single component
   * If the component to be obtained is not a vue component, an error will be thrown
   * @param componentPath The file path where the component is located
   * @param exportName Component export name, the default is to get `export default`
   */
  public getComponentMeta(
    componentPath: string,
    exportName = 'default',
  ): SingleComponentMeta {
    const { langService, ts, options, repo } = this;
    const program = langService.tsLs.getProgram()!;
    const typeChecker = program.getTypeChecker();
    const { symbolNode, exports } = getExports(
      ts,
      program,
      typeChecker,
      componentPath,
    );
    const _export = exports.find(
      (property) => property.getName() === exportName,
    );

    if (!_export) {
      throw `Could not find export ${exportName}`;
    }
    const resolver = new SchemaResolver(
      ts,
      typeChecker,
      langService,
      symbolNode!,
      repo,
      options,
    );
    const component = this.getSingleComponentMeta(
      typeChecker,
      symbolNode,
      _export,
      componentPath,
      exportName,
      resolver,
    );
    return {
      component,
      types: resolver.getTypes(),
    };
  }

  /**
   * Close the Type checker service
   */
  public close() {
    this.langService.tsLs.dispose();
  }
}
