//// 获取值或者创建init函数的值
export function getOrCreate<K, V>(map: Map<K, V>, key: K, init: () => V): V {
	const existing = map.get(key);

	if (existing !== undefined) {
		return existing;
	}

	//// 使用init函数生成默认值
	const value = init();

	map.set(key, value);

	return value;
}

export function getNewSet<T>() {
	return new Set<T>();
}

export function getNewArray<T>(): T[] {
	return [];
}
