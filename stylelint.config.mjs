/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-prettier'],
  rules: {
    // # Customizations ==========================================================
    // Allow special pseudo-classes like :global used in CSS modules.
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global'],
      },
    ],
    // Allow composes property used in CSS modules.
    'property-no-unknown': [
      true,
      {
        ignoreProperties: ['composes'],
      },
    ],
    // Allow rpx unit used in Taro.
    'unit-no-unknown': [
      true,
      {
        ignoreUnits: ['rpx'],
      },
    ],

    // # SCSS Specific =============================================================
    // Enforce kebab-case for SCSS variables.
    'scss/dollar-variable-pattern': [/^([a-z][a-z0-9]*)(-[a-z0-9]+)*$/, {
      message: 'Expected variable to be in kebab-case'
    }],
    // Disallow redundant nesting selectors (`&`).
    'scss/selector-no-redundant-nesting-selector': true,

    // # Disabled Rules ==========================================================
    // Disable due to false positives with SCSS variables and functions.
    // The SCSS parser should handle this, but as a fallback, this prevents build failures.
    'declaration-property-value-no-unknown': null,
  },
};
