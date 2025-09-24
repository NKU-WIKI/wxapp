/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-standard-scss", "stylelint-config-prettier"],
  rules: {
    "scss/at-rule-no-unknown": true,
    "property-no-unknown": [
      true,
      {
        "ignoreProperties": ["/composes/"]
      }
    ],
    "selector-pseudo-class-no-unknown": [
        true,
        {
            "ignorePseudoClasses": ["global"]
        }
    ],
    "declaration-property-value-no-unknown": true
  }
};
