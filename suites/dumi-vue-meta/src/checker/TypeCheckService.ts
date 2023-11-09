import type {
  TypeScriptLanguageHost,
  VueCompilerOptions,
} from '@vue/language-core';
import { VueFile } from '@vue/language-core';
import type ts from 'typescript/lib/tsserverlibrary';
import { SchemaResolver } from '../schemaResolver/index';
import type {
  ComponentLibraryMeta,
  ComponentMeta,
  MetaCheckerOptions,
  MetaTransformer,
  PropertyMeta,
  SingleComponentMeta,
} from '../types';
import { getJsDocTags } from '../utils';
import { createVueLanguageService } from './createVueLanguageService';
import {
  getExports,
  readTsComponentDefaultProps,
  readVueComponentDefaultProps,
} from './helpers';

/**
 * Provide component metadata checker services
 */
export class TypeCheckService {
  private langService!: ReturnType<typeof createVueLanguageService>;
  private globalPropNames?: string[];
  private options!: MetaCheckerOptions;

  constructor(
    private readonly ts: typeof import('typescript/lib/tsserverlibrary'),
    checkerOptions: MetaCheckerOptions,
    private vueCompilerOptions: VueCompilerOptions,
    private globalComponentName: string,
    _host: TypeScriptLanguageHost,
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
        const tags = getJsDocTags(ts, typeChecker, slot);
        return !tags['ignore'];
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
        const tags = getJsDocTags(ts, typeChecker, slot);
        return !tags['ignore'];
      });

      return properties.map((prop) => {
        return resolver.resolveSlotProperties(prop);
      });
    }

    return [];
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
      const properties = type.getProperties().filter((prop) => {
        const tags = getJsDocTags(ts, typeChecker, prop);

        if (tags['ignore']) return false;

        if (options.filterExposed) {
          return !!tags['exposed'] || !!tags['expose'];
        }
        // It can also be entered if it is marked as exposed.
        if (prop.valueDeclaration && (!!tags['exposed'] || !!tags['expose'])) {
          return true;
        }
        // only exposed props will not have a valueDeclaration
        return !(prop as any).valueDeclaration;
      });

      return properties.map((prop) => {
        return resolver.resolveExposedProperties(prop);
      });
    } else {
      throw 'This is not a vue component';
    }
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
    const { langService, ts, options } = this;
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
      typeChecker,
      symbolNode,
      options,
      ts,
    );

    typeResolver.preResolve(exportedTypes);

    const components = exports.reduce((acc, _export) => {
      const exportedName = _export.getName();
      try {
        const meta = this.getSingleComponentMeta(
          typeChecker,
          symbolNode,
          _export,
          entry,
          exportedName,
          typeResolver,
        );
        acc[exportedName] = meta;
      } catch (error) {}
      return acc;
    }, {} as ComponentLibraryMeta['components']);

    const meta: ComponentLibraryMeta = {
      components,
      types: typeResolver.getTypes(),
    };

    return transformer ? transformer(meta) : (meta as T);
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
    const symbolProperties = componentType.getProperties() ?? [];

    let _type: ComponentMeta['type'] | undefined;
    let _props: ComponentMeta['props'] | undefined;
    let _events: ComponentMeta['events'] | undefined;
    let _slots: ComponentMeta['slots'] | undefined;
    let _exposed: ComponentMeta['exposed'] = this.getExposed(
      typeChecker,
      symbolProperties,
      symbolNode,
      resolver,
    ); // Get it in advance to determine whether it is a vue component

    return this.createComponentMeta(
      {
        name: exportName,
      },
      {
        type: () =>
          _type ??
          (_type = this.getType(typeChecker, symbolProperties, symbolNode)),
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
        exposed: () => _exposed,
      },
    );
  }

  /**
   * Get metadata of single component
   * If the component to be obtained is not a vue component, an error will be thrown
   * @param componentPath
   * @param exportName Component export name, the default is to get `export default`
   */
  public getComponentMeta(
    componentPath: string,
    exportName = 'default',
  ): SingleComponentMeta {
    const { langService, ts, options } = this;
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

    const resolver = new SchemaResolver(typeChecker, symbolNode!, options, ts);

    return {
      component: this.getSingleComponentMeta(
        typeChecker,
        symbolNode,
        _export,
        componentPath,
        exportName,
        resolver,
      ),
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
