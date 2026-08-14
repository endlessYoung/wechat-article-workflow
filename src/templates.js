/**
 * 文案模板数据（与 templates/*.md 保持同步）。
 * 引擎仅在显式占位符 {{transition}} / {{hook}} / {{ending}} 处使用；
 * 更精细的创作请由 Agent 依据 templates/*.md 完成。
 */

export const HOOKS = [
  '你有没有过这样的时刻：明明下定了决心，却在第三天就悄悄放弃了？',
  '先别急着往下读，问自己一个问题：过去一年，哪件事你坚持了下来？',
  '如果只能留下一个习惯，你会选择哪一个？想清楚再往下看。',
  '一个看似普通的动作，重复一百次，结果可能完全不同。',
  '三年前，我差点放弃写作。后来我想明白了一件小事。',
];

export const TRANSITIONS = [
  '理解了背景，我们再来看看具体应该怎么做。',
  '道理讲完了，真正拉开差距的，是执行。',
  '那么，具体该怎么落地呢？下面给你一套可操作的方法。',
  '除了方法本身，还有一个常被忽略的因素。',
  '到这里，核心思路已经清晰了，最后再补充一个细节。',
  '说完了正面案例，也别忘了常见的坑。',
];

export const ENDINGS = [
  '别等一个完美的时机。今天，就从最小的一步开始。',
  '如果这篇文章对你有用，欢迎转发给需要的朋友。',
  '你最近想养成什么习惯？欢迎在留言区告诉我。',
  '方法再多，不行动都是零。现在就去做两分钟。',
];

/** 显式占位符：{{transition}} / {{hook}} / {{ending}} */
export const PLACEHOLDER_RE = /^\{\{(transition|hook|ending)\}\}$/;

const POOLS = { transition: TRANSITIONS, hook: HOOKS, ending: ENDINGS };

/** 按序号循环取一条模板句。 */
export function pick(list, index) {
  return list[index % list.length];
}

/** 根据占位符类型取模板句。 */
export function resolvePlaceholder(kind, index) {
  return pick(POOLS[kind] || TRANSITIONS, index);
}
