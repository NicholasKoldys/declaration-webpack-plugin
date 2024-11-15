import { Compiler, Compilation } from "webpack";

const PLUGIN_NAME = 'DeclarationWebpackPlugin';

export enum moduleType {
  commonJS = 'commonJS',
  esm = 'esm',
  amd = 'amd',
  umd = 'umd'
};

type DeclarationFiles = {
  [ fileName: string ] : {
    _valueIsBuffer: boolean,
    _value: string,
    source: () => string,
    _valueAsBuffer: [] | undefined,
    _valueAsString: string,
  } |  
  // @ts-ignore
  Source;
}

export interface options {
  outputFile?: string;
  excludedReferences?: string[];
  moduleName?: string;
  moduleType?: moduleType;
  isFileCommented?: boolean;
}

export class DeclarationWebpackPlugin {
  outputFile: string;
  moduleName: string;
  excludedReferences: string[];
  moduleType: moduleType;
  isFileCommented: boolean;

  constructor(options: any = {}) {
    this.outputFile = options?.outputFile || "./build/index.d.ts";
    this.excludedReferences = options?.excludedReferences || undefined;
    this.moduleName = options?.moduleName || "";
    this.moduleType = options?.moduleType || moduleType.esm;
    this.isFileCommented = options?.isFileCommented || false;
  }

  apply( compiler: Compiler ) {
    const { webpack } = compiler;
    const { Compilation } = webpack;
    const { RawSource } = webpack.sources;

    compiler.hooks.thisCompilation.tap( PLUGIN_NAME, (
      compilation: Compilation
    ) => {
      compilation.hooks.processAssets.tap(
        { name: PLUGIN_NAME,
          stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
        },
        (assets) => {
          const logger = compilation.getLogger(PLUGIN_NAME);
          const declarationFiles: DeclarationFiles = {};
          for( const filename in assets ) {
            logger.info(filename);
            if( filename.includes(".d.ts") ) {
              declarationFiles[filename] = assets[filename];
              compilation.deleteAsset(filename);
            }
          }
          
          this.generateCombinedDeclaration(declarationFiles).then( dFile => 
            compilation.emitAsset( this.outputFile, new RawSource(dFile) )
          );
        }
      );
    });
  }

  private async generateCombinedDeclaration(declarationFiles: DeclarationFiles): Promise<string> {

    // function moduleOptHeader() {
    //    return 
    // }

    /* */

    const exludeModulareized = (() => {

      let stringExcluded = ``;

      // if( !this.isFileCommented ) stringExcluded += "((?!\`)(\/\/|\/+\\*+|\\*+\/+))|";

      switch (this.moduleType) {
        case moduleType.esm:
          // moduleOptHeader``;
          stringExcluded += " ?import ?\{[a-z0-9 -_]+\} ?from.*";
          break;
        case moduleType.commonJS:
          // moduleOptHeader``;
          stringExcluded += " ?import ?([a-z0-9 -_]+) ?= ?require ?\(";
          break;
        default:
          // moduleOptHeader``;
          stringExcluded += " ?import ?\{[a-z0-9 -_]+\} ?from.*";
          break;
      };

      return RegExp( stringExcluded, 'i');
    })();
    
    let declarations = "";
    for( let file in declarationFiles ) {
      let lines: string[] = declarationFiles[file].source().split("\n");;
      let i = lines.length;

      while( i --> 0 ) {
        let readLine = lines[i];
        let isExcluded = readLine == "" || exludeModulareized?.test(readLine) || readLine.includes('export {}');

        if( !isExcluded && this.excludedReferences && readLine.includes("<reference") ) {
          isExcluded = this.excludedReferences.some( (reference) => 
            readLine.includes(reference)
          );
        }

        if( isExcluded ) {
          lines.splice(i, 1);

        } else {
          if( readLine.includes("declare ") ) {
            lines[i] = readLine.replace("declare ", "");
          }
          this.moduleType == moduleType.commonJS 
            ? lines[i] = "\t" + lines[i]
          : null;
        }
      }
      
      if(this.isFileCommented) {
        lines[0] = 
          `//* ${file} \n` 
          + lines[0];
      }
      
      declarations += lines.join("\n") + '\n\n';
    }
    const declaredModule = this.moduleName == "" 
      ? "MyPackage"
    : this.moduleName;

    return (
      this.moduleType == moduleType.esm 
        ? this.isFileCommented 
          && `/** declared module "${declaredModule}"*/\n\n${declarations}`
          || declarations 
      : 
      this.moduleType == moduleType.commonJS 
        ? `declare module "${declaredModule}" {\n${declarations}\n};` 
      : declarations
    );
  }
}
