# Declaration-Webpack-Plugin

@nicholaskoldys/declaration-webpack-plugin

## Build / Package

Process to build:
```
pnpm build
```

### Build Steps 

- run typescript cli for typechecking and declaration file creation.
    - sent to build folder.
- run test (FAIL IF non-passing)
- run esbuild for export and minifying/ofuscating final tar-ball/zip.