import type { Compiler } from "webpack";
export declare enum moduleType {
    commonJS = "commonJS",
    esm = "esm",
    amd = "amd",
    umd = "umd"
}
export interface options {
    outputFile?: string;
    excludedReferences?: string[];
    moduleName?: string;
    moduleType?: moduleType;
    isFileCommented?: boolean;
}
export declare class DeclarationWebpackPlugin {
    outputFile: string;
    moduleName: string;
    excludedReferences: string[];
    moduleType: moduleType;
    isFileCommented: boolean;
    constructor(options?: any);
    apply(compiler: Compiler): void;
    private generateCombinedDeclaration;
}
export declare function isWebpackPlugin(str: string): boolean;
