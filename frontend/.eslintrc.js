// eslint-disable-next-line no-undef
module.exports = {
   env: {
      browser: true,
      es2021: true,
   },
   parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
   },
   overrides: [
      {
         files: ['**/*.ts', '**/*.tsx'],
         extends: [
            'eslint:recommended',
            'plugin:prettier/recommended',
            'plugin:react/recommended',
            'plugin:react-hooks/recommended',
            'plugin:@typescript-eslint/recommended',
         ],
         parser: '@typescript-eslint/parser',
         settings: {
            react: {
               version: 'detect',
            },
         },
         plugins: ['react', '@typescript-eslint'],
         rules: {
            'prettier/prettier': [
               'warn',
               {
                  endOfLine: 'auto',
               },
            ],
            '@typescript-eslint/ban-ts-comment': 'warn',
            'react/jsx-props-no-spreading': 'off',
            'sort-imports': [
               'warn',
               {
                  ignoreCase: false,
                  ignoreDeclarationSort: true,
                  ignoreMemberSort: false,
                  allowSeparatedGroups: false,
               },
            ],
            'no-restricted-imports': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-restricted-imports': [
               'warn',
               {
                  name: 'react-redux',
                  importNames: ['useSelector', 'useDispatch'],
                  message: 'Используй типизированые хуки `useAppDispatch` и `useAppSelector` проекте.',
               },
               {
                  name: 'index',
                  importNames: ['RootStore'],
                  message: 'Используй расширенный тип стора `StateSchema` проекте.',
               },
            ],
            'no-debugger': 'error',
            'no-console': [
               'warn',
               {
                  allow: ['off', 'error'],
               },
            ],
            // 'react/jsx-indent': ['error', 3],
            'react/jsx-filename-extension': [
               'error',
               {
                  extensions: ['.js', '.jsx', 'tsx'],
               },
            ],
            'react/react-in-jsx-scope': 'off',
            'react-hooks/rules-of-hooks': 'off',
            'react-hooks/exhaustive-deps': 'off',
            'linebreak-style': ['off', 'windows'],
            quotes: ['error', 'single'],
            semi: ['warn', 'never'],
            'max-len': [
               'warn',
               {
                  ignoreComments: true,
                  code: 124,
               },
            ],
            'react/display-name': 'off',
         },
      },
      {
         files: ['**/*.js', '**/*.jsx'],
         extends: [
            'eslint:recommended',
            'plugin:prettier/recommended',
            'plugin:react/recommended',
            'plugin:react-hooks/recommended',
         ],
         rules: {
            'prettier/prettier': [
               'warn',
               {
                  endOfLine: 'auto',
               },
            ],
            'react/jsx-props-no-spreading': 'off',
            'no-unused-vars': [
               'error',
               {
                  varsIgnorePattern: 'React',
               },
            ],
            semi: 'off',
            'react/react-in-jsx-scope': 'off',
            'no-debugger': 'error',
            'no-console': [
               'warn',
               {
                  allow: ['off', 'error'],
               },
            ],
            // 'react/jsx-indent': [
            //    'warn',
            //    3
            // ],
            'react/prop-types': 'off',
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'off',
            'linebreak-style': ['off', 'windows'],
            quotes: ['warn', 'single'],
            'max-len': [
               'warn',
               {
                  ignoreComments: true,
                  code: 124,
               },
            ],
            'react/display-name': 'off',
         },
      },
   ],
}
