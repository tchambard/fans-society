import {
	Dispatch,
	MutableRefObject,
	SetStateAction,
	useEffect,
	useRef,
	useState,
} from 'react';

export function usePrevious<T>(value: T): T {
	const ref = useRef<T>(value);
	useEffect(() => {
		ref.current = value;
	}, [value, ref]);
	return ref.current;
}

export function useLocalStorage<T>(
	key: string,
	defaultValue: T,
): [T, Dispatch<SetStateAction<T>>] {
	const [value, setValue] = useState<T>(() => {
		const saved = localStorage.getItem(key);
		const initial = saved && JSON.parse(saved);
		return initial || defaultValue;
	});

	useEffect(() => {
		localStorage.setItem(key, JSON.stringify(value));
	}, [key, value]);

	return [value, setValue];
}
