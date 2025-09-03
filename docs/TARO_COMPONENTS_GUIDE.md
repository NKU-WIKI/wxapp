# Taro 常用组件用法总结

本文档旨在总结 Taro 框架中常用内置组件的核心用法，方便快速查阅和使用。

## 1. 基础组件

### View
`View` 是最基础的视图容器，类似于 HTML 中的 `div`。

**常用属性:**
- `className`: CSS 类名
- `style`: 内联样式
- `onClick`: 点击事件

**示例:**
```tsx
<View className='my-class' style={{ padding: '10px' }} onClick={this.handleClick}>
  这是一个 View 容器
</View>
```

### Text
`Text` 用于展示文本，类似于 HTML 中的 `span`。

**常用属性:**
- `selectable`: 是否可选中文本
- `space`: 显示连续空格

**示例:**
```tsx
<Text selectable>这是一段可以选中的文本。</Text>
```

### Image
`Image` 用于渲染图片。

**常用属性:**
- `src`: 图片资源地址
- `mode`: 图片裁剪、缩放模式 (e.g., `scaleToFill`, `aspectFit`)
- `lazyLoad`: 是否懒加载

**示例:**
```tsx
<Image src='/assets/logo.png' mode='aspectFit' lazyLoad />
```

## 2. 表单组件

### Input
`Input` 是单行输入框。

**常用属性:**
- `value`: 输入框的当前内容
- `type`: 输入类型 (`text`, `number`, `password`)
- `placeholder`: 占位符
- `onInput`: 输入事件
- `onConfirm`: 点击完成按钮时触发

**示例:**
```tsx
<Input
  value={inputValue}
  placeholder='请输入用户名'
  onInput={(e) => setInputValue(e.detail.value)}
/>
```

### Textarea
`Textarea` 是多行输入框。

**常用属性:**
- `value`: 当前内容
- `placeholder`: 占位符
- `maxlength`: 最大输入长度
- `autoHeight`: 是否自动增高

**示例:**
```tsx
<Textarea
  value={textValue}
  placeholder='请输入详细描述'
  maxlength={200}
  autoHeight
/>
```

### Button
`Button` 按钮组件。

**常用属性:**
- `type`: 按钮样式 (`primary`, `default`, `warn`)
- `size`: 按钮尺寸 (`default`, `mini`)
- `loading`: 是否带 loading 图标
- `disabled`: 是否禁用
- `openType`: 开放能力，如 `share`, `getUserInfo`

**示例:**
```tsx
<Button type='primary' loading={isLoading} onClick={handleSubmit}>
  提交
</Button>
```

## 3. 滚动与选择

### ScrollView
`ScrollView` 可滚动视图区域。

**常用属性:**
- `scrollY`: 允许纵向滚动
- `scrollX`: 允许横向滚动
- `onScrollToUpper`: 滚动到顶部/左边时触发
- `onScrollToLower`: 滚动到底部/右边时触发

**示例:**
```tsx
<ScrollView scrollY style={{ height: '200px' }} onScrollToLower={loadMore}>
  {items.map(item => <View key={item.id}>{item.name}</View>)}
</ScrollView>
```

### Picker
`Picker` 从底部弹起的滚动选择器。这是实现下拉选择的核心组件。

**`mode` 属性是关键，决定了选择器的类型:**

- **`selector`**: 普通选择器。需要提供 `range` 数组。
  - `range`: `string[]` 或 `object[]`。
  - `rangeKey`: 当 `range` 是 `object[]` 时，指定显示哪个字段。
  - `onChange`: 用户选择后触发，`e.detail.value` 是选中项的索引。

  ```tsx
  const range = ['中国', '美国', '巴西'];
  <Picker mode='selector' range={range} onChange={this.onCountryChange}>
    <View>当前选择：{range[selectedIndex]}</View>
  </Picker>
  ```

- **`multiSelector`**: 多列选择器。`range` 是一个二维数组。`onChange` 返回一个索引数组。

  ```tsx
  const range = [['A', 'B'], ['a', 'b']];
  <Picker mode='multiSelector' range={range} onChange={...}>
      ...
  </Picker>
  ```

- **`time`**: 时间选择器。
  - `value`: `HH:mm` 格式的字符串。
  - `start`, `end`: 可选时间的范围。
  - `onChange`: `e.detail.value` 返回 `HH:mm` 格式的字符串。

  ```tsx
  <Picker mode='time' value={time} onChange={this.onTimeChange}>
    <View>选择时间：{time}</View>
  </Picker>
  ```

- **`date`**: 日期选择器。
  - `value`: `YYYY-MM-DD` 格式的字符串。
  - `start`, `end`: 可选日期的范围。
  - `fields`: 选择精度 (`year`, `month`, `day`)。
  - `onChange`: `e.detail.value` 返回 `YYYY-MM-DD` 格式的字符串。

  ```tsx
  <Picker mode='date' value={date} onChange={this.onDateChange}>
    <View>选择日期：{date}</View>
  </Picker>
  ```

- **`region`**: 省市区选择器。`onChange` 返回包含省市区的数组。

---

## 4. 导航与媒体

### Navigator
`Navigator` 用于页面跳转，类似于 HTML 中的 `<a>` 标签。

**常用属性:**
- `url`: 跳转的目标页面路径
- `openType`: 跳转方式 (`navigate`, `redirect`, `switchTab`, `reLaunch`)
- `hoverClass`: 点击时的样式类

**示例:**
```tsx
<Navigator url='/pages/profile/index' openType='switchTab'>
  <Button>跳转到个人中心</Button>
</Navigator>
```

### Video
`Video` 组件用于播放视频。

**常用属性:**
- `src`: 视频资源地址
- `controls`: 是否显示默认播放控件
- `autoplay`: 是否自动播放
- `loop`: 是否循环播放

**示例:**
```tsx
<Video
  src={videoUrl}
  controls
  autoplay={false}
  style={{ width: '100%' }}
/>
```

## 5. 地图与画布

### Map
`Map` 组件用于在页面中渲染地图。

**常用属性:**
- `longitude`: 中心经度
- `latitude`: 中心纬度
- `scale`: 缩放级别
- `markers`: 标记点，可以放置多个

**示例:**
```tsx
<Map
  longitude={116.39742}
  latitude={39.90933}
  scale={14}
  markers={[{
    id: 1,
    latitude: 39.90933,
    longitude: 116.39742,
    title: '天安门'
  }]}
  style={{ width: '100%', height: '300px' }}
/>
```

### Canvas
`Canvas` 组件用于创建画布，可以通过 API 动态绘制图形。

**常用属性:**
- `canvasId`: 画布的唯一标识
- `style`: 设置画布宽高

**示例:**
```tsx
// TSX 部分
<Canvas canvasId='myCanvas' style={{ width: '300px', height: '200px' }} />

// 逻辑部分
const ctx = Taro.createCanvasContext('myCanvas');
ctx.setStrokeStyle('red');
ctx.moveTo(10, 10);
ctx.lineTo(100, 10);
ctx.stroke();
ctx.draw();
```

## 6. 开放能力

### WebView
`WebView` 组件用于在小程序内承载网页。

**重要提示:**
- 需要在 `app.config.ts` 中配置业务域名白名单。
- 仅支持 `https` 协议。

**常用属性:**
- `src`: 要嵌入的网页 `url`

**示例:**
```tsx
<WebView src='https://taro.jd.com' />
```

---

以上是 Taro 中最核心和常用的组件。对于更复杂的 UI 需求，可以考虑使用 `Taro UI` 组件库，它提供了更丰富的预设组件。
