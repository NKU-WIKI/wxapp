Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    extClass: {
      type: String,
      value: ''
    },
    type: {
      type: String,
      value: 'error'
    },
    show: {
      type: Boolean,
      value: false,
      observer: '_showChange'
    },
    msg: {
      type: String,
      value: ''
    },
    delay: {
      type: Number,
      value: 3000
    }
  },
  data: {
    timer: null
  },
  lifetimes: {
    detached: function() {
      this._clearTimer();
    }
  },
  methods: {
    _showChange(newValue) {
      this._clearTimer();
      if (newValue) {
        const delay = this.data.delay;
        if (delay && delay > 0) {
          this.data.timer = setTimeout(() => {
            this.setData({
              show: false
            });
          }, delay);
        }
      }
    },
    _clearTimer() {
      if (this.data.timer) {
        clearTimeout(this.data.timer);
        this.data.timer = null;
      }
    }
  }
}) 