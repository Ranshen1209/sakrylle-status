/** 桌面表格的条件列开关。下面这 5 列会按运行时开关或数据情况显隐，
 *  而每一列都要在 <colgroup>、<thead>、每个 <tbody> 行三处各写一遍——三处漏改
 *  一处就整表错位。故由 StatusTable 派生一次、同一个对象喂给表头与行两个组件，
 *  杜绝三处各算各的。守卫见 statusTableColumns.test.tsx（4 轴全组合列数与顺序）。
 *
 *  canonical 顺序（含恒显示列）：
 *    annotation? · provider? · service · channel · model? · price? ·
 *    listedDays? · uptime · lastCheck · quality? · drawing? · trend
 *
 *  Sakrylle 状态页固定关闭 model / price / listedDays。模型厂商没有独立的列：
 *  它是逐模型的属性，只在模型列打开时画在模型名前（见 ModelName）。
 */
export interface StatusTableColumns {
  /** 标注列。数据驱动：本屏没有任何一行带标注就整列不渲染。 */
  annotation: boolean;
  /** 服务商列。服务商详情页里恒关（页面本身已限定服务商）。 */
  provider: boolean;
  /** 模型列。Sakrylle 状态页关闭。 */
  model: boolean;
  /** 价格列。Sakrylle 状态页关闭，不跟随 hide_price_column。 */
  price: boolean;
  /** 上架天数列。Sakrylle 状态页关闭。 */
  listedDays: boolean;
  /** 质量列。rpdiag 总开关，私有部署未接 rpdiag 时整列消失。 */
  quality: boolean;
  /** 画作列。rpdiag 启用 + 站点没关（hide_drawing_column）+ 访客没关，三者同时成立才出。 */
  drawing: boolean;
}
