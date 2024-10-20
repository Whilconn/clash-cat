export async function runBatch(asyncTasks, batchSize) {
  const results = [];

  // 分批次
  for (let i = 0; i < asyncTasks.length; i += batchSize) {
    const batchTasks = asyncTasks.slice(i, i + batchSize);

    // 批量执行
    const batchResults = await Promise.allSettled(batchTasks).then((resList) => {
      return resList.map((res) => {
        return res.status === 'fulfilled' ? res.value : new Error(res.reason || '未知异常');
      });
    });

    results.push(...batchResults);
  }

  return results;
}
