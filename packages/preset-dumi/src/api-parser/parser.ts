import { ComponentDoc, Parser, ParserOptions, withCompilerOptions } from "react-docgen-typescript";
import { Props } from "react-docgen-typescript/lib/parser";
import ts from 'typescript';

const defaultParserOpts = {
    savePropValueAsString: true,
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
}

interface ModuleDoc extends ComponentDoc {
    // distinguish component and interface from modules
    type: 'component' | 'interface';
    interfaceName?: string;
}

// reference by https://github.com/styleguidist/react-docgen-typescript/blob/master/src/parser.ts#L196
const isOptional = (prop: ts.Symbol) => (prop.getFlags() & ts.SymbolFlags.Optional) !== 0;

function getModuleDocFromProps(props: Props, interfaceName: string): ModuleDoc[] {
    const docs: ModuleDoc[] = [];

    docs.push({
        type: 'interface',
        tags: {},
        description: '',
        displayName: '',
        interfaceName,
        methods: [],
        props
    });

    return docs;
}

/**
 * get all type names of component props
 */
function getAllPropsParent(docs: ModuleDoc[]) {
    const propsSet = new Set();
    docs.forEach(doc => {
        Object.keys(doc.props).forEach(key => {
            const parentName = doc.props[key].parent?.name;
            if (parentName) {
                propsSet.add(parentName);
            }
        })
    });
    return Array.from(propsSet);
}


export default (filePath: string, options: ts.CompilerOptions, parserOpts?: ParserOptions) => {

    const opts = Object.assign(defaultParserOpts, parserOpts);

    const program = ts.createProgram([filePath], options);
    const parser = new Parser(program, opts);
    const checker = program.getTypeChecker();

    const sourceFile = program.getSourceFile(filePath);
    const moduleSymbol = checker.getSymbolAtLocation(sourceFile);

    if (moduleSymbol) {
        // get all export modules
        const modules = checker.getExportsOfModule(moduleSymbol);

        const duplicatedInfos: ModuleDoc[] = [];

        // get all type modules
        modules.forEach(module => {
            const declaration = module.valueDeclaration || module.declarations![0];

            // getTypeOfSymbolAtLocation can only get types of values
            let type = checker.getTypeOfSymbolAtLocation(module, declaration);
            const typeSymbol = type.symbol || type.aliasSymbol;
            if (!typeSymbol) {
                // getDeclaredTypeOfSymbol can get types of types
                type = checker.getDeclaredTypeOfSymbol(module);

                const props = type.getApparentProperties();

                const result: Props = {};
                props.forEach(prop => {
                    const propName = prop.getName();
                    const jsDocComment = parser.findDocComment(prop);
                    const defaultValue = { value: jsDocComment.tags.default };
                    const description = jsDocComment.fullComment.replace(/\r\n/g, '\n');

                    const declarations = prop.declarations || [];
                    const baseProp = props.find(p => p.getName() === propName);


                    const required =
                        !isOptional(prop) &&
                        // If in a intersection or union check original declaration for "?"
                        declarations.every(d => !(d as any).questionToken) &&
                        (!baseProp || !isOptional(baseProp));

                    const propType = jsDocComment.tags.type
                        ? {
                            name: jsDocComment.tags.type
                        }
                        : parser.getDocgenType(checker.getTypeOfSymbolAtLocation(prop, declaration), required);

                    result[propName] = {
                        defaultValue,
                        description,
                        name: propName,
                        parent: null,
                        required,
                        type: propType,
                    };
                });
                const docs = getModuleDocFromProps(result, module.getName());
                duplicatedInfos.push(...docs);
            }
        });

        // get all component modules
        const docs: ModuleDoc[] = withCompilerOptions(options, opts).parse(filePath).map(i => ({ type: 'component', ...i }));

        // to get component props name for eliminating of duplication
        const componentPropsName = getAllPropsParent(docs);

        duplicatedInfos.push(...docs);

        const exportsInfo = duplicatedInfos.filter(info => {
            return !componentPropsName.includes(info.interfaceName)
        })

        return exportsInfo;
    }
    return [];
}