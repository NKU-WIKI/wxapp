/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-standard-scss", "stylelint-config-prettier"],
  rules: {
    // "scss/at-rule-no-unknown": true, // This is already covered by standard-scss
    "property-no-unknown": [
      true,
      {
        "ignoreProperties": ["composes"]
      }
    ],
    "selector-pseudo-class-no-unknown": [
        true,
        {
            "ignorePseudoClasses": ["global"]
        }
    ],
    // Disable this rule because it incorrectly flags SCSS variables, functions and rpx units
    "declaration-property-value-no-unknown": null
  }
};
