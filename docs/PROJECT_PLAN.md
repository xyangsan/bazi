# 八字排盘网站 - 项目规划文档

## 项目概述
创建一个完整的八字排盘网站，支持输入个人信息后自动生成八字排盘结果，包括基础排盘和专业细盘。

## 技术栈
- **前端**: Vue 3 + Vite + TypeScript + Element Plus + Pinia
- **后端**: Node.js + Express + TypeScript + MySQL
- **共享模块**: 八字计算核心算法（shared）

## 目录结构规划
```
bazi/
├── frontend/        # 前端项目 (Vue 3 + Vite)
├── backend/         # 后端项目 (Node.js + Express)
├── shared/          # 共享代码（八字算法核心逻辑）
├── docs/            # 文档
│   ├── PROJECT_PLAN.md  # 项目规划
│   ├── FUNCTION_CHECKLIST.md # 功能校验清单
│   ├── paipan-result.md # 基础排盘表格结构
│   ├── paipan-result-detail.md # 专业细盘表格结构
│   ├── css/         # 样式文件
│   └── images/      # 参考图片
└── images/          # 五行图标
```

## 功能模块详细规划

### 模块1: 输入表单模块
**文件位置**: `web/src/views/InputForm.vue`

**功能清单**:
- [ ] 姓名输入框
- [ ] 性别选择（男/女）
- [ ] 出生日期选择器（公历）
  - 自动显示对应农历日期
  - 支持公历/农历切换显示
- [ ] 出生时间选择器
  - 支持精确时间或时辰选择
  - 自动计算时辰对应的地支
- [ ] 出生地选择
  - 关联时区信息
  - 支持省市区三级联动
- [ ] 排盘按钮
- [ ] 输入验证

**API接口**:
- `POST /api/paipan/calculate` - 提交信息并计算八字

---

### 模块2: 基础排盘结果显示
**文件位置**: `web/src/views/BasicPaipan.vue`
**参考图片**: `docs/images/paipan-result.png`
**表格结构**: `docs/paipan-result.md`

**功能清单**:
- [ ] 显示四柱信息（年柱、月柱、日柱、时柱）
- [ ] 每一列包含以下行：
  - 日期标签
  - 主星（十神）
  - 天干（带五行图标）
  - 地支（带五行图标）
  - 藏干（天干+五行）
  - 副星（十神）
  - 星运
  - 自坐
  - 空亡
  - 纳音
  - 神煞
- [ ] 五行统计展示
- [ ] 打印/导出功能

**数据格式**:
```typescript
interface BasicPaipanResult {
  year: PillarData;
  month: PillarData;
  day: PillarData;
  hour: PillarData;
  wuxingCount: Record<string, number>;
}

interface PillarData {
  date: string;
  mainStar: string;  // 十神
  tiangan: { char: string; wuxing: string };
  dizhi: { char: string; wuxing: string };
  canggan: Array<{ tiangan: string; shishen: string }>;
  fuxing: string[];  // 副星
  xingyun: string;
  zizuo: string;
  kongwang: string;
  nayin: string;
  shensha: string[];
}
```

---

### 模块3: 专业细盘模块
**文件位置**: `web/src/views/ProPaipan.vue`
**参考图片**: `docs/images/paipan-result-detail.png`
**表格结构**: `docs/paipan-result-detail.md`

**功能清单**:
- [ ] 左侧：排盘明细表格
  - [ ] 起运信息
  - [ ] 交运信息
  - [ ] 空亡简介
  
- [ ] 右侧：主表格（6列）
  - 列：流年 | 大运 | 年柱 | 月柱 | 日柱 | 时柱
  - 行：日期、主星、天干、地支、藏干、副星、星运、自坐、空亡、纳音、神煞

- [ ] 大运列表
  - 显示所有大运阶段
  - 可点击切换查看对应大运的详细信息

- [ ] 流年列表
  - 显示当前大运下的所有流年
  - 可点击切换

- [ ] 流月列表
  - 显示当前流年下的所有流月
  - 可点击切换

- [ ] 流日列表
  - 显示当前流月下的所有流日
  - 可点击切换

- [ ] 流时列表
  - 显示当前流日下的所有流时
  - 可点击切换

- [ ] 动态切换功能
  - 点击流年/流月/流日/流时，左侧表格内容相应更新
  - 高亮当前选中项

**数据格式**:
```typescript
interface ProPaipanResult {
  basic: BasicPaipanResult;  // 基础四柱
  qiyun: string;              // 起运
  jiaoyun: string;            // 交运
  kongwangIntro: string;      // 空亡简介
  dayun: DayunData[];         // 大运列表
  currentDayun: DayunData;    // 当前选中的大运
  liunian: LiunianData[];     // 流年列表
  currentLiunian: LiunianData;
  liuyue: LiuyueData[];       // 流月列表
  currentLiuyue: LiuyueData;
  liuri: LiuriData[];         // 流日列表
  currentLiuri: LiuriData;
  liushi: LiushiData[];       // 流时列表
  currentLiushi: LiushiData;
}

interface DayunData {
  index: number;
  startAge: number;
  endAge: number;
  tiangan: string;
  dizhi: string;
  shishen: string;  // 十神
  nayin: string;
}
```

---

### 模块4: 八字计算核心算法（shared）
**文件位置**: `shared/src/`

**功能清单**:
- [ ] 公历转农历算法
  - 支持1900-2100年
  - 返回农历年月日、闰月信息
  
- [ ] 天干地支计算
  - 年柱计算（以立春为界）
  - 月柱计算（以节气为界）
  - 日柱计算
  - 时柱计算
  
- [ ] 十神计算
  - 根据日干与其他天干的关系计算十神
  
- [ ] 藏干计算
  - 根据地支计算藏干
  
- [ ] 纳音计算
  - 根据天干地支计算纳音五行
  
- [ ] 神煞计算
  - 天乙贵人、太极贵人、文昌贵人等
  
- [ ] 大运计算
  - 根据性别和年干阴阳计算顺逆
  - 计算出起运年龄和每一步大运
  
- [ ] 流年、流月、流日、流时计算

**核心文件**:
```
shared/src/
├── lunar.ts          # 农历转换
├── tiangan-dizhi.ts  # 天干地支
├── shishen.ts        # 十神计算
├── nayin.ts          # 纳音计算
├── canggan.ts        # 藏干计算
├── shensha.ts        # 神煞计算
├── dayun.ts          # 大运计算
├── liunian.ts        # 流年计算
├── paipan.ts         # 排盘主函数
└── types.ts          # 类型定义
```

---

### 模块5: 后端API服务
**文件位置**: `server/src/`

**API接口清单**:
- [ ] `POST /api/paipan/calculate` - 计算八字排盘
  - 请求体：{ name, gender, date, time, birthplace }
  - 返回：基础排盘 + 专业细盘数据
  
- [ ] `GET /api/paipan/history` - 获取历史排盘记录
  
- [ ] `POST /api/paipan/save` - 保存排盘结果
  
- [ ] `GET /api/paipan/:id` - 获取指定排盘详情

**数据库设计**:
```sql
-- 用户信息表
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50),
  gender ENUM('male', 'female'),
  birth_date DATE,
  birth_time TIME,
  birthplace VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 排盘结果表
CREATE TABLE paipan_results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  year_pillar VARCHAR(10),
  month_pillar VARCHAR(10),
  day_pillar VARCHAR(10),
  hour_pillar VARCHAR(10),
  result_json TEXT,  -- 完整结果JSON
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

### 模块6: 前端UI组件
**文件位置**: `web/src/components/`

**组件清单**:
- [ ] `PillarTable.vue` - 四柱表格组件
- [ ] `WuxingIcon.vue` - 五行图标组件
- [ ] `DayunList.vue` - 大运列表组件
- [ ] `LiunianList.vue` - 流年列表组件
- [ ] `ProPaipanTable.vue` - 专业细盘表格组件
- [ ] `WuxingStats.vue` - 五行统计组件

---

## 实现优先级

### 第一阶段（核心功能）
1. [ ] 创建 shared 模块，实现八字计算核心算法
2. [ ] 创建前端输入表单
3. [ ] 实现基础排盘显示
4. [ ] 搭建后端API框架

### 第二阶段（专业功能）
1. [ ] 实现专业细盘显示
2. [ ] 实现大运计算
3. [ ] 实现流年/流月/流日/流时计算
4. [ ] 实现动态切换功能

### 第三阶段（完善功能）
1. [ ] 数据库集成
2. [ ] 历史记录功能
3. [ ] 打印/导出功能
4. [ ] UI美化
5. [ ] 响应式适配

---

## 技术难点
1. **农历算法准确性**: 需要精确的公历转农历算法
2. **节气计算**: 月柱以节气为界，需要精确节气时间
3. **真太阳时**: 根据出生地计算真太阳时
4. **大运起运计算**: 需要根据性别和年干阴阳确定顺逆
5. **性能优化**: 大量八字计算需要优化性能

---

## 下一步行动
1. 初始化前端项目 (Vue 3 + Vite)
2. 初始化后端项目 (Node.js + Express + TypeScript)
3. 创建 shared 模块，实现核心算法
4. 创建输入表单页面
5. 实现基础排盘显示
