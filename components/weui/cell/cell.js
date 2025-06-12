Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    hover: {
      type: Boolean,
      value: false
    },
    link: {
      type: Boolean,
      value: false
    },
    icon: {
      type: String,
      value: ''
    },
    value: {
      type: String,
      value: ''
    },
    footer: {
      type: String,
      value: ''
    },
    inline: {
      type: Boolean,
      value: false
    },
    extClass: {
      type: String,
      value: ''
    }
  },
  methods: {
    navigateTo() {
      this.triggerEvent('tap');
    }
  }
}) 